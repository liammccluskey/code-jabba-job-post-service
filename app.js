import 'dotenv/config'
import cron from 'node-cron'
import { fetchJobs } from './src/jobsClient'
import { extractJobData } from './src/openaiClient'
import { postJob } from './src/codeJabbaClient'
import {USCities} from './src/jobsClient/constants'

// Job runner arrow function
const runJobServicePipeline = async () => {
    try {
        for (let i = 0; i < USCities.length; i++) {
            const location = USCities[i]

            const jobs = await fetchJobs(location)

            for (let j = 0; j < jobs.length; i++) {
                const {openaiPayload, fullJobData} = jobs[j]

                const extractedJobData = await extractJobData(openaiPayload)

                const postedJob = await postJob(extractJobData, fullJobData)

                console.log(postedJob.data.message)
            }
        }

        console.log('Job pipeline finished')
    } catch (error) {
        console.error('Pipeline failed:', error.message)
    }
}

// // Schedule job to run every day at 1 AM EST
// cron.schedule('0 1 * * *', () => {
//     runJobPipeline()
// }, {
//     scheduled: true,
//     timezone: 'America/New_York'
// })

// Run immediately on startup (optional)
runJobPipeline()
