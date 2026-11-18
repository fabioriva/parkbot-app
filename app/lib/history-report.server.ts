import { setImmediate } from "node:timers/promises"
import PDFDocument from "pdfkit"
import { m } from "@paraglide/messages.js"
import type { Locale } from "@paraglide/runtime.js"
import type { HistoryEntry } from "~/routes/aps/history"
import { formatPlantDateTime, type PlantDateRange } from "./date-time"
import { logT, safeMessageT } from "./trans"
import type { HistoryParameters } from "./history-query"

export async function createHistoryReport({
  records,
  plant,
  timeZone,
  range,
  filters,
  locale,
  now = new Date(),
}: {
  records: HistoryEntry[]
  plant: string
  timeZone: string
  range: PlantDateRange
  filters: HistoryParameters
  locale: Locale
  now?: Date
}): Promise<Buffer> {
  const options = { locale }
  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margin: 36,
    info: {
      Title: `${m.history_title({}, options)} — ${plant}`,
      Author: "Parkbot",
    },
  })
  const chunks: Buffer[] = []
  const result = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk))
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)
  })
  const left = 36
  const bottom = doc.page.height - 48
  const widths = [118, 90, 90, 300, 58, 58, 56]
  const tableWidth = widths.reduce((sum, width) => sum + width, 0)
  const rowPadding = 5
  const lineHeight = 11
  const minRowHeight = lineHeight + rowPadding * 2
  const headers = [
    m.history_table_head_date({}, options),
    m.history_table_head_device({}, options),
    m.history_table_head_mode({}, options),
    m.history_table_head_operation({}, options),
    m.history_table_head_card({}, options),
    m.history_table_head_stall({}, options),
    m.history_table_head_size({}, options),
  ]
  let page = 0
  let y = 0
  const text = (value: unknown) =>
    String(value ?? "—").replace(/[\r\n\t]+/g, " ")
  // Wrap by glyph width; this also handles long identifiers without spaces.
  const lines = (value: string, width: number) => {
    const output: string[] = []
    let line = ""
    for (const char of value) {
      if (line && doc.widthOfString(line + char) > width) {
        output.push(line)
        line = ""
      }
      line += char
    }
    output.push(line)
    return output
  }
  const startPage = () => {
    if (page) doc.addPage()
    page++
    doc.fillColor("#171717").font("Helvetica-Bold").fontSize(15)
    doc.text(`${text(plant)} · ${m.history_title({}, options)}`, left, 30, {
      width: tableWidth,
      lineBreak: false,
      ellipsis: true,
    })
    doc.font("Helvetica").fontSize(8).fillColor("#525252")
    doc.text(
      m.history_pdf_summary({ ...range, count: records.length }, options),
      left,
      55,
      { lineBreak: false }
    )
    const all = m.history_pdf_all({}, options)
    doc.text(
      `${m.aps_field_time_zone({}, options)}: ${timeZone} · ${headers[4]}: ${filters.card || all} · ${headers[1]}: ${filters.device || all} · ${headers[5]}: ${filters.stall || all}`,
      left,
      69,
      { lineBreak: false }
    )
    doc.text(
      m.history_pdf_generated(
        { date: formatPlantDateTime(now, timeZone, "dd/MM/yyyy HH:mm:ss xxx") },
        options
      ),
      left,
      83,
      { lineBreak: false }
    )
    const footer = m.history_pdf_page({ page }, options)
    // A width activates PDFKit's wrapping even with lineBreak: false.
    // Position this single line directly so the footer cannot add a page.
    doc.text(
      footer,
      left + tableWidth - doc.widthOfString(footer),
      doc.page.height - 28,
      {
        lineBreak: false,
      }
    )
    y = 104
    doc.rect(left, y, tableWidth, 22).fill("#eeeeee")
    doc.fillColor("#171717").font("Helvetica-Bold").fontSize(8)
    let x = left
    headers.forEach((label, index) => {
      doc.text(label, x + 5, y + 7, {
        width: widths[index] - 10,
        lineBreak: false,
        ellipsis: true,
      })
      x += widths[index]
    })
    y += 22
    doc.font("Helvetica").fontSize(8)
  }
  try {
    startPage()
    if (!records.length)
      doc.text(m.history_pdf_empty({}, options), left, y + 12)
    for (const [index, record] of records.entries()) {
      if (index % 100 === 0) await setImmediate()
      const device =
        record.device?.id === 0
          ? record.user || m.operator({}, options)
          : record.device?.key
      const description =
        logT(record, locale) ||
        safeMessageT("history_table", record.operation?.key, {}, locale)
      const cells = [
        formatPlantDateTime(record.date, timeZone, "dd/MM/yyyy HH:mm:ss xxx"),
        text(device),
        record.device?.id === 0
          ? "—"
          : safeMessageT("mode", record.mode?.key, {}, locale),
        `${record.alarm ? `AL${record.alarm.id} · ` : ""}${description}`,
        text(record.card),
        text(record.stall),
        text(record.size),
      ]
      const wrapped = cells.map((cell, index) =>
        lines(cell, widths[index] - 10)
      )
      const count = Math.max(...wrapped.map((cell) => cell.length))
      // Split exceptionally tall rows across pages, preserving every line.
      let offset = 0
      while (offset < count) {
        if (bottom - y < minRowHeight) startPage()
        const take = Math.min(
          count - offset,
          Math.floor((bottom - y - rowPadding * 2) / lineHeight)
        )
        const height = take * lineHeight + rowPadding * 2
        doc.fillColor("#171717")
        let x = left
        wrapped.forEach((cell, index) => {
          cell.slice(offset, offset + take).forEach((line, lineIndex) =>
            doc.text(line, x + 5, y + rowPadding + lineIndex * lineHeight, {
              width: widths[index] - 10,
              lineBreak: false,
            })
          )
          x += widths[index]
        })
        y += height
        doc
          .moveTo(left, y)
          .lineTo(left + tableWidth, y)
          .lineWidth(0.4)
          .strokeColor("#dddddd")
          .stroke()
        offset += take
      }
    }
    doc.end()
  } catch (error) {
    doc.destroy(
      error instanceof Error ? error : new Error("PDF generation failed")
    )
  }
  return result
}
