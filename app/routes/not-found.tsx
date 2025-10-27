import { useTranslation } from "react-i18next";
import { data, Link, useNavigate } from "react-router";

export async function loader() {
  return data(null, { status: 404 });
}

export default function Component() {
  const navigate = useNavigate();
  let { t } = useTranslation("notFound");

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col gap-6 text-center">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm">{t("description")}</p>
        <Link
          className="underline"
          onClick={(e) => {
            e.preventDefault();
            navigate(-1);
          }}
        >
          {t("backToHome")}
        </Link>
      </div>
    </div>
  );
}
