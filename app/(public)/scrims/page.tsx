import { redirect } from "next/navigation";

export default function PublicScrimsPage() {
  redirect("/annonces?vue=scrims");
}
