"use client";

export default function SortSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <select
      name="sort"
      defaultValue={defaultValue}
      onChange={(e) => {
        const form = e.target.form;
        if (form) form.submit();
      }}
      className="bg-transparent border-none font-medium focus:ring-0 cursor-pointer text-gray-900 dark:text-white"
    >
      <option value="">Newest First</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
    </select>
  );
}
