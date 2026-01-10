import Card from "@/components/Card";
import CardCompact from "@/components/CardCompact";
import { useAddFavoritePropertyMutation, useGetAuthenticatedUserQuery, useGetPropertiesQuery, useGetTenantQuery, useRemoveFavoritePropertyMutation } from "@/state/api"
import { useAppSelector } from "@/state/redux";
import { Property } from "@/types";
import { useEffect } from "react";

function Listings() {

  const { data: autUser } = useGetAuthenticatedUserQuery();
  const { data: tenant } = useGetTenantQuery(
    autUser?.cognitoInfo.userId || "",
    {
      skip: !autUser?.cognitoInfo?.userId
    }
  );
  const [addFavorite] = useAddFavoritePropertyMutation()
  const [removeFavorite] = useRemoveFavoritePropertyMutation();
  const viewMode = useAppSelector(state => state.global.viewMode)
  const filters = useAppSelector(state => state.global.filters)

  const {
    data: properties,
    isLoading,
    isError
  } = useGetPropertiesQuery(filters)

  const handleFavoriteToggle = async (propertyId: number) => {
    if (!autUser) return;

    const isFavorite = tenant?.favorites.some(
      (fav: Property) => fav.id === propertyId
    );

    if (isFavorite) {
      await removeFavorite({
        cognitoId: autUser.cognitoInfo.userId,
        propertyId
      })
    } else {
      await addFavorite({
        cognitoId: autUser.cognitoInfo.userId,
        propertyId
      })
    }
  }

  if (isLoading) return <>Loading....</>
  if (isError || !properties) return <div>Failed To fetch properties</div>

  return (
    <div className="w-full">
      <h3 className="text-sm px-4 font-bold">
        {properties.length}{" "}
        <span className="text-gray-700 font-normal">
          Places in {filters.location}
        </span>
      </h3>
      <div className="flex">
        <div className="p-4 w-full">
          {properties?.map((property) => {
            return viewMode === "grid"
              ? <Card
                key={property.id}
                property={property}
                isFavorite={
                  tenant?.favorites.some(
                    (fav: Property) => fav.id === property.id
                  ) || false
                }
                onFavoriteToggle={() => {
                  handleFavoriteToggle(property.id)
                }
                }
                showFavoriteButton={true}
                propertyLink={`/search/${property.id}`}
              />
              : <CardCompact
                key={property.id}
                property={property}
                isFavorite={
                  tenant?.favorites.some(
                    (fav: Property) => fav.id === property.id
                  ) || false
                }
                onFavoriteToggle={() => {
                  handleFavoriteToggle(property.id)
                }
                }
                showFavoriteButton={true}
                propertyLink={`/search/${property.id}`}
              />
          })}
        </div>
      </div>
    </div>
  )
}

export default Listings
