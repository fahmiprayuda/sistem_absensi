import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function ClassesPage() {

  const { data: classes, error } = await supabase
    .from("classes")
    .select("*")
    .order("name");

  if (error) {
    console.log(error);
  }

  return (
    <div className="p-8">

      <h1 className="text-2xl font-bold mb-6">
        Daftar Kelas
      </h1>

      <div className="grid grid-cols-3 gap-4">

        {classes?.map((kelas) => (
          <Link
            key={kelas.id}
            href={`/classes/${kelas.id}`}
            className="p-6 border rounded-lg hover:bg-gray-100"
          >
            <h2 className="text-lg font-semibold">
              {kelas.name}
            </h2>
          </Link>
        ))}

      </div>
    </div>
  );
}