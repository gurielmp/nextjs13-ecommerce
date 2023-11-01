import FormSubmitButton from "@/components/FormSubmitButton";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOption } from "../api/auth/[...nextauth]/route";

export const metadata = {
  title: "Add Product | Guriel",
};

async function addProduct(FormData: FormData) {
  "use server";

  const session = await getServerSession(authOption);
  if (!session) {
    redirect("api/auth/signin?callbackUrl=/add-product");
  }

  const name = FormData.get("name")?.toString();
  const description = FormData.get("description")?.toString();
  const imageUrl = FormData.get("imageUrl")?.toString();
  const price = Number(FormData.get("price") || 0);

  if (!name || !description || !imageUrl || !price) {
    throw Error("Please fill all the fields");
  }

  await prisma.product.create({
    data: {
      name,
      description,
      imageUrl,
      price,
    },
  });
  redirect("/");
}

export default async function AddProductPage() {
  const session = await getServerSession(authOption);
  if (!session) {
    redirect("api/auth/signin?callbackUrl=/add-product");
  }

  return (
    <div>
      <h1 className="mb-3 text-lg font-bold">Add Product</h1>
      <form action={addProduct}>
        <input
          required
          type="text"
          name="name"
          placeholder="Name"
          className="input input-bordered mb-3 w-full"
        />
        <textarea
          required
          name="description"
          placeholder="Description"
          className="textarea textarea-bordered mb-3 w-full"
          id=""
        ></textarea>
        <input
          required
          type="url"
          name="imageUrl"
          placeholder="Image URL"
          className="input input-bordered mb-3 w-full"
        />
        <input
          required
          type="number"
          name="price"
          placeholder="Price"
          className="input input-bordered mb-3 w-full"
        />
        <FormSubmitButton className="btn-block">Add Product</FormSubmitButton>
      </form>
    </div>
  );
}
