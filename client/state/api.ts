import { createNewUserInDatabase } from "@/lib/utils";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { Tenant, Manager } from "@/types/index"


export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers)=>{
      const session = await fetchAuthSession();
      const { idToken } = session.tokens ?? {}
      if(idToken){
        headers.set("Authorization", `Bearer ${idToken}`);
      }
    }

  }),
  reducerPath: "api",
  tagTypes: ["managers", "tenants"],
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

          if(userDeatailResponse.error && userDeatailResponse.error.status==404){
            userDeatailResponse = await createNewUserInDatabase(
              user,
              userRole,
              fetchWithBaseQuery,
              idToken
            )
          }

          // if user doesn't exist we have to create ne user

          return {
            data:{
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

    updateTenantSettings: build.mutation<Tenant, {cognitoId: string} & Partial<Tenant>>({
      query: ({cognitoId, ...updatedTenant}) => ({
        url: `tenants/${cognitoId}`,
        method: "PUT",
        body: updatedTenant
      }),
      invalidatesTags: (result) => [{type: "tenants", id: result?.id}],
    }),
    updateManagerSettings: build.mutation<Manager, {cognitoId: string} & Partial<Manager>>({
      query: ({cognitoId, ...updatedManager}) => ({
        url: `managers/${cognitoId}`,
        method: "PUT",
        body: updatedManager
      }),
      invalidatesTags: (result) => [{type: "managers", id: result?.id}],
    }),
    
  }),
});

export const {
  useGetAuthenticatedUserQuery,
  useUpdateTenantSettingsMutation,
  useUpdateManagerSettingsMutation
} = api;
