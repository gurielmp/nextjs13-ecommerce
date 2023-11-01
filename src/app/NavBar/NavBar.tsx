import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/logo.png";
import { redirect } from "next/navigation";
import { getCart } from "@/lib/db/cart";
import ShoppingCartButton from "./ShoppingCartButton";
import UserMenuButton from "./UserMenuButton";
import { getServerSession } from "next-auth";
import { authOption } from "../api/auth/[...nextauth]/route";

async function searchProducts(formData: FormData) {
  "use server";

  const searchQuery = formData.get("searchQuery")?.toString();
  if (searchQuery) {
    redirect(`/search?query=${searchQuery}`);
  }
}

export default async function NavBar() {
  const session = await getServerSession(authOption);
  const cart = await getCart();
  return (
    <div className="bg-base-100">
      <div className="max navbar m-auto max-w-7xl flex-col gap-2 sm:flex-row">
        <div className="flex-1 ">
          <Link href="/" className="font-100 btn btn-ghost text-xl normal-case">
            <Image src={logo} alt="Guriel Logo" width={40} height={40} />
            zone
          </Link>
        </div>
        <div className="flex-none gap-2">
          <form action={searchProducts}>
            <div className="form-control">
              <input
                name="searchQuery"
                placeholder="Search"
                className="input input-bordered w-full min-w-[100px]"
              />
            </div>
          </form>
          <ShoppingCartButton cart={cart} />
          <UserMenuButton session={session} />
        </div>
      </div>
    </div>
  );
}
