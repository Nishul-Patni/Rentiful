"use client"

import { useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useAppSelector } from "@/state/redux";
import { useGetPropertiesQuery } from "@/state/api";
import { map, property } from "lodash";
import { Property } from "@/types";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

function Map() {
    const mapContainerRef = useRef(null);
    const filters = useAppSelector((state) => state.global.filters)
    const isFiltersFullOpen = useAppSelector((state) => state.global.isFiltersFullOpen)

    const {
        data: properties,
    } = useGetPropertiesQuery(filters)


    useEffect(() => {
        if (!properties) return;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current!,
            center: filters.coordinates || [-74.5, 40],
            style: "mapbox://styles/nishul-patni/cmjx8imxl002a01s96cwxe7wi",
            zoom: 9
        })

        properties.forEach((property) => {
            const marker = createPropertyMarker(property, map);
            const markerElement = marker.getElement();
            const path = markerElement.querySelector("path[fill='#3FB1CE']");
            if (path) path.setAttribute("fill", "#000000");
        });

        const resizeMap = () => setTimeout(() => map.resize, 700);
        resizeMap();

        return () => {
            map.remove();
        }
    }, [filters.coordinates, properties])

    return (
        <div className="basis-5/12 grow relative rounded-xl">
            <div
                className="map-container rounded-xl"
                ref={mapContainerRef}
                style={{
                    height: "100%",
                    width: "100%"
                }}
            />
        </div>
    )
};

const createPropertyMarker = (property: Property, map: mapboxgl.Map) => {
    const marker = new mapboxgl.Marker()
        .setLngLat([
            property.location.coordinates.longitude,
            property.location.coordinates.latitude,
        ])
        .setPopup(
            new mapboxgl.Popup().setHTML(
                `
        <div class="marker-popup">
          <div class="marker-popup-image"></div>
          <div>
            <a href="/search/${property.id}" target="_blank" class="marker-popup-title">${property.name}</a>
            <p class="marker-popup-price">
              $${property.pricePerMonth}
              <span class="marker-popup-price-unit"> / month</span>
            </p>
          </div>
        </div>
        `
            )
        )
        .addTo(map);
    return marker;
};


export default Map
