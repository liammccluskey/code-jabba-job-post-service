import axios from "axios"
import 'dotenv/config'

export const CODE_JABBA_API_URL = {
    DEV: process.env.CODE_JABBA_API_URL_DEV,
    PROD: process.env.CODE_JABBA_API_URL_PROD,
}[process.env.PROFILE_ENV]

const codeJabbaApi = axios.create({
    baseURL:  CODE_JABBA_API_URL,
    headers: {
        api_key: process.env.CODE_JABBA_API_KEY
    }
})

export const postJob = async (openaiJobData, fullJobData, location) => {

    const jobData = {
        ...fullJobData,
        ...openaiJobData,
        location
    }

    try {
        const res = await codeJabbaApi.post('/jobs/job-post-service', {
            job: jobData
        })
        
        return res
    } catch (error) {
        console.log('Failed to post job to Code Jabba.')
        console.log(error)
        throw error
    }
}