import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import BuilderClient from "./BuilderClient";

// We use 'any' here to safely handle the newest Next.js update where params is a Promise
export default async function BuilderPage(props: any) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  // Wait for the URL ID to be ready
  const resolvedParams = await props.params;

  // Look up the specific form using the ID in the URL
  const form = await prisma.form.findUnique({
    where: { id: resolvedParams.id, userId: session.user?.id },
  });

  if (!form) {
    return <div className="p-8 text-center text-red-500 font-bold">Form not found!</div>;
  }

  // Magic Fix: Convert the raw database object into safe, plain JSON text 
  // before handing it to the visual Client Component
  const safeForm = JSON.parse(JSON.stringify(form));

  return <BuilderClient form={safeForm} />;
}