import { cleanParams, createNewUserInDatabase } from "@/lib/utils";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { Tenant, Manager, Property } from "@/types/index"
import { FiltersState } from "./index"
import { result } from "lodash";


export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      const session = await fetchAuthSession();
      const { idToken } = session.tokens ?? {}
      if (idToken) {
        headers.set("Authorization", `Bearer ${idToken}`);
      }
    }

  }),
  reducerPath: "api",
  tagTypes: ["managers", "tenants", "Properties", "PropertyDetails"],
  endpoints: (build) => ({
    getAuthenticatedUser: build.query<User, void>({
      queryFn: async (_, _api, _extraOptions, fetchWithBaseQuery) => {
        try {

          const session = await fetchAuthSession();
          const { idToken } = session.tokens ?? {}
          const user = await getCurrentUser();
          const userRole = idToken?.payload["custom:role"] as string;

          const endpoint = userRole === "manager" ?
            `managers/${user.userId}`
            : `/tenants/${user.userId}`;


          let userDeatailResponse = await fetchWithBaseQuery(endpoint);

          if (userDeatailResponse.error && userDeatailResponse.error.status == 404) {
            userDeatailResponse = await createNewUserInDatabase(
              user,
              userRole,
              fetchWithBaseQuery,
              idToken
            )
          }

          // if user doesn't exist we have to create ne user

          return {
            data: {
              cognitoInfo: {
                ...user
              },
              userInfo: userDeatailResponse.data as Tenant | Manager,
              userRole
            }
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          return {
            error: error.message || "Could Not fetch user data"
          }
        }
      }
    }),

    updateManagerSettings: build.mutation<Manager, { cognitoId: string } & Partial<Manager>>({
      query: ({ cognitoId, ...updatedManager }) => ({
        url: `managers/${cognitoId}`,
        method: "PUT",
        body: updatedManager
      }),
      invalidatesTags: (result) => [{ type: "managers", id: result?.id }],
    }),

    // property related endpoints
    getProperties: build.query<Property[], Partial<FiltersState> & { favoriteIds?: number[] }>({
      query: (filters) => {
        const params = cleanParams({
          location: filters.location,
          priceMin: filters.priceRange?.[0],
          priceMax: filters.priceRange?.[1],
          beds: filters.beds,
          baths: filters.baths,
          propertyType: filters.propertyType,
          squareFeetMin: filters.squareFeet?.[0],
          squareFeetMax: filters.squareFeet?.[1],
          amenities: filters.amenities?.join(","),
          availableFrom: filters.availableFrom,
          favoriteIds: filters.favoriteIds?.join(","),
          latitude: filters.coordinates?.[1],
          longitude: filters.coordinates?.[0],
        });

        return { url: "properties", params };
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: "Properties" as const, id })),
            { type: "Properties", id: "LIST" },
          ]
          : [{ type: "Properties", id: "LIST" }],
    }),
    getProperty: build.query<
      Property,
      number
    >({
      query: (id) => `properties/${id}`,
      providesTags: (_result, _error, id) => [{ type: "PropertyDetails", id }]
    }),

    //tenant related endpoints
    getTenant: build.query<
      Tenant,
      string
    >({
      query: (cognitoId) => `tenants/${cognitoId}`,
      providesTags: (result) => [{ type: "tenants", id: result?.id }]
    }),

    addFavoriteProperty: build.mutation<Tenant, { cognitoId: string, propertyId: number }>({
      query: ({ cognitoId, propertyId }) => {
        return {
          url: `tenants/${cognitoId}/favorites/${propertyId}`,
          method: "POST"
        }
      },
      invalidatesTags: (results) => [
        { type: "tenants", id: results?.id },
        { type: "Properties", id: "LIST" }
      ]
    }),

    removeFavoriteProperty: build.mutation<Tenant, { cognitoId: string, propertyId: number }>({
      query: ({ cognitoId, propertyId }) => {
        return {
          url: `tenants/${cognitoId}/favorites/${propertyId}`,
          method: "DELETE"
        }
      },
      invalidatesTags: (results) => [
        { type: "tenants", id: results?.id },
        { type: "Properties", id: "LIST" }
      ]
    }),

    updateTenantSettings: build.mutation<Tenant, { cognitoId: string } & Partial<Tenant>>({
      query: ({ cognitoId, ...updatedTenant }) => ({
        url: `tenants/${cognitoId}`,
        method: "PUT",
        body: updatedTenant
      }),
      invalidatesTags: (result) => [{ type: "tenants", id: result?.id }],
    })
  }),


});

export const {
  useGetAuthenticatedUserQuery,
  useUpdateTenantSettingsMutation,
  useUpdateManagerSettingsMutation,
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useGetTenantQuery,
  useAddFavoritePropertyMutation,
  useRemoveFavoritePropertyMutation
} = api;
