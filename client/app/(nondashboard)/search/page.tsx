"use client"

import { NAVBAR_HEIGHT } from "@/lib/constants";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { useSearchParams } from "next/navigation"
import FiltersBar from "./FiltersBar";
import FiltersFull from "./FiltersFull";
import { useEffect } from "react";
import { setFilters } from "@/state";
import { cleanParams } from "@/lib/utils";

function SearchPage() {

  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const isFilterFullOpen = useAppSelector(
    (state) => {
      return state.global.isFiltersFullOpen
    }
  );

  const initialFilters = useAppSelector(
    (state) => state.global.filters
  )

  useEffect(() => {
    const initialFilters = Array.from(searchParams.entries()).reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (acc: any, [key, value]) => {
        if (key === "priceRange" || key === "squareFeet") {
          acc[key] = value.split(",").map((v) => (v === "" ? null : Number(v)));
        } else if (key === "coordinates") {
          acc[key] = value.split(",").map(Number);
        } else {
          acc[key] = value === "any" ? null : value;
        }

        return acc;
      }, {})

    const cleanedFilters = cleanParams(initialFilters);
    dispatch(setFilters(cleanedFilters));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className="w-full mx-auto px-5 flex flex-col"
      style={
        {
          height: `calc(100vh - ${NAVBAR_HEIGHT}px)`
        }
      }
    >
      <FiltersBar />
      <div className="flex justify-between flex-1 overflow-hidden gap-3 mb-5">
        <div className={`h-full overflow-auto transition-all duration-300 ease-in-out ${isFilterFullOpen ? "w-3/12 opacity-100 visible" : "w-0 opacity-0 invisible"}`}>
          <FiltersFull />
        </div>
        {/* <Map /> */}
        <div className="basis-4/12 overflow-y-auto">
          {/* <Listings /> */}
        </div>
      </div>
    </div>
  )
}

export default SearchPage
