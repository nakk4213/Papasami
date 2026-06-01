import { redirect } from "next/navigation";

export default async function AdminModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  redirect(`/admin/${module}`);
}
