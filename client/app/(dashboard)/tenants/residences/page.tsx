"use client"

import Card from "@/components/Card";
import Header from "@/components/Header"
import Loading from "@/components/Loading";
import { useGetAuthenticatedUserQuery, useGetCurrentResidencesQuery, useGetPropertiesQuery, useGetTenantQuery } from "@/state/api"
import { Property, Tenant } from "@/types";

function Residences() {

  const { data: authUser } = useGetAuthenticatedUserQuery();
  const { data: tenant } = useGetTenantQuery(
    authUser?.cognitoInfo?.userId || "",
    {
      skip: !authUser?.cognitoInfo.userId
    }
  );

  const {
    data: currentResidences,
    isLoading,
    error,
  } = useGetCurrentResidencesQuery(
    authUser?.cognitoInfo?.userId || "",
    {
      skip: !authUser?.cognitoInfo?.userId 
    }
  )

  if (isLoading) return <Loading />

  if (error) return <div>Error loading Current Residences</div>

  return (
    <div className="dashboard-container">
      <Header title="Currenrt Residences" subtitle="View and Manage your current living spaces" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {
          currentResidences?.map((property) => {
            return <Card
              key={property.id}
              property={property}
              isFavorite={
                tenant?.favorites.includes(property.id) || false
              }
              onFavoriteToggle={() => {
               // handleFavoriteToggle(property.id)
              }
              }
              showFavoriteButton={false}
              propertyLink={`/tenants/residneces/${property.id}`}
            />
          })
        }
      </div>
      {(!currentResidences || currentResidences.length === 0) && (
        <p>
          You don&apos;t have any Current Residences
        </p>
      )}
    </div>
  )
}

export default Residences
