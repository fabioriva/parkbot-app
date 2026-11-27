import { Pie, PieChart, Sector } from "recharts"
import { Link, useNavigate } from "react-router"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart"
import {
  buildCardMovementShares,
  type CardMovementTotal,
} from "~/lib/card-usage-chart"
import { m } from "@paraglide/messages.js"
import { getLocale } from "@paraglide/runtime.js"

export function CardMovementsChart({
  topCards,
  total,
  cardLink,
}: {
  topCards: CardMovementTotal[]
  total: number
  cardLink: (card: number) => string
}) {
  const navigate = useNavigate()
  const locale = getLocale()
  const number = new Intl.NumberFormat(locale)
  const percent = new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 1,
  })
  const formatShare = (movements: number) => {
    const share = movements / total
    return share > 0 && share < 0.001
      ? `< ${percent.format(0.001)}`
      : percent.format(share)
  }
  const slices = buildCardMovementShares(topCards, total).map(
    (slice, index) => ({
      ...slice,
      label:
        slice.card === undefined
          ? m.operations_cards_other()
          : m.operations_cards_detail({ card: slice.card }),
      fill:
        slice.card === undefined
          ? "var(--muted-foreground)"
          : `var(--chart-${index + 1})`,
    })
  )

  return (
    <div className="grid items-center gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
      <div className="relative mx-auto w-full max-w-60">
        <ChartContainer
          config={{}}
          className="aspect-square w-full"
          initialDimension={{ width: 240, height: 240 }}
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name) => (
                    <span>
                      {name} · {number.format(Number(value))} (
                      {formatShare(Number(value))})
                    </span>
                  )}
                />
              }
            />
            <Pie
              data={slices}
              dataKey="movements"
              nameKey="label"
              innerRadius="60%"
              outerRadius="93%"
              stroke="var(--card)"
              isAnimationActive={false}
              shape={(props) => (
                <Sector
                  {...props}
                  className={
                    slices[props.index]?.card === undefined
                      ? undefined
                      : "cursor-pointer"
                  }
                />
              )}
              onClick={(_, index) => {
                const card = slices[index]?.card
                if (card !== undefined) void navigate(cardLink(card))
              }}
            />
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
          <span className="text-xl font-semibold tabular-nums">
            {number.format(total)}
          </span>
          <span className="text-xs text-muted-foreground">
            {m.operations_cards_movements()}
          </span>
        </div>
      </div>
      <ul className="w-full max-w-md divide-y">
        {slices.map((slice) => {
          const content = (
            <>
              <span className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: slice.fill }}
                />
                <span>{slice.label}</span>
              </span>
              <span className="ml-auto shrink-0 text-right tabular-nums">
                {number.format(slice.movements)} ({formatShare(slice.movements)}
                )
              </span>
            </>
          )
          const row = "flex items-center gap-3 px-2 py-2 text-sm"
          return (
            <li key={slice.card ?? "other"}>
              {slice.card === undefined ? (
                <div className={row}>{content}</div>
              ) : (
                <Link
                  className={`${row} rounded-md hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring`}
                  to={cardLink(slice.card)}
                >
                  {content}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
