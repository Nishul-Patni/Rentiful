"use client"

import SettingsForm from "@/components/SettingsForm";
import { SettingsFormData } from "@/lib/schemas";
import { useGetAuthenticatedUserQuery, useUpdateTenantSettingsMutation } from "@/state/api"

function TenantSettings() {

    const { data: authUser, isLoading } = useGetAuthenticatedUserQuery()
    const [updateTenant] = useUpdateTenantSettingsMutation();
    
    if(isLoading) return <>Loading...</>

    const initialData: SettingsFormData= {
        name: authUser?.userInfo.name,
        email: authUser?.userInfo.email,
        phoneNumber: authUser?.userInfo.phoneNumber
    }

    const handleSubmit = async (data: typeof initialData) =>{
        await updateTenant({
            cognitoId: authUser?.cognitoInfo?.userId,
            ...data
        })
    }

    return (
        <SettingsForm initialData={initialData} onSubmit={handleSubmit} userType="tenant"/>
    )
}

export default TenantSettings
