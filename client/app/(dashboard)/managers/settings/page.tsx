"use client"

import SettingsForm from "@/components/SettingsForm";
import { SettingsFormData } from "@/lib/schemas";
import { useGetAuthenticatedUserQuery, useUpdateManagerSettingsMutation } from "@/state/api"

function ManagerSettings() {

    const { data: authUser, isLoading } = useGetAuthenticatedUserQuery()
    const [updateManager] = useUpdateManagerSettingsMutation();
    console.log(authUser)
    if(isLoading) return <>Loading...</>

    const initialData: SettingsFormData= {
        name: authUser?.userInfo.name,
        email: authUser?.userInfo.email,
        phoneNumber: authUser?.userInfo.phoneNumber
    }

    const handleSubmit = async (data: typeof initialData) =>{
        await updateManager({
            cognitoId: authUser?.cognitoInfo?.userId,
            ...data
        })
    }

    return (
        <SettingsForm initialData={initialData} onSubmit={handleSubmit} userType="manager"/>
    )
}

export default ManagerSettings
