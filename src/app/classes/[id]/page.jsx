import { supabase } from "@/lib/supabase";
import StudentsClient from "./StudentsClient";

export async function generateMetadata({ params }) {
  const { id } = await params;

  const { data } = await supabase
    .from("classes")
    .select("name")
    .eq("id", id)
    .single();

  return {
    title: "Absensi Kelas " + data.name,
  };
}

export default async function ClassDetail({ params }) {
  const { id } = await params;

  const today = new Date().toISOString().split("T")[0];

  const { data: students } = await supabase
    .from("students")
    .select(
      `
      id,
      name,
      nis,
      attendance (
        status,
        date
      )
    `,
    )
    .eq("class_id", id)
    .eq("attendance.date", today)
    .order("name");

  const { data: classData } = await supabase
    .from("classes")
    .select("name")
    .eq("id", id)
    .single();

  return <StudentsClient students={students} classData={classData} />;
}
