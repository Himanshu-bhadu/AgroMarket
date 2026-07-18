    "use client";

    import { useCart } from "@/app/context/CartContext";
    import { useSession } from "next-auth/react";
    import { useRouter } from "next/navigation";
    import { useState } from "react";

    interface Props {
    product: {
        id: string;
        name: string;
    };
    }

    export default function AddToCartButton({ product }: Props) {
    const { addToCart } = useCart();
    const { status } = useSession();
    const router = useRouter();
    const [isAdding, setIsAdding] = useState(false);

    const handleAddClick = async () => {
        if (status === "unauthenticated") {
        router.push("/login");
        return;
        }

        setIsAdding(true);
        await addToCart(product.id);
        setIsAdding(false);
    };
    

    return (
        <button
        onClick={handleAddClick}
        disabled={isAdding}
        className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
        >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        {isAdding ? "Adding..." : "Add to Cart"}
        </button>
    );
    }