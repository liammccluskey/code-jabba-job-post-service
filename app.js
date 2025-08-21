import 'dotenv/config'
import cron from 'node-cron'
import { fetchJobs } from './src/jobsClient/index.js'
import { extractJobData } from './src/openaiClient/index.js'
import { postJob } from './src/codeJabbaClient/index.js'
import {USCities} from './src/jobsClient/constants.js'

// Job runner arrow function
const runJobServicePipeline = async () => {
    try {
        for (let i = 0; i < USCities.length; i++) {
            const location = USCities[i]

            try {
                console.log('fetching jobs for location: ' + location)
                const jobs = await fetchJobs(location)

                for (let j = 0; j < jobs.length; j++) {
                    const {openaiJobPayload, fullJobData} = jobs[j]

                    try {
                        const extractedJobData = await extractJobData(openaiJobPayload)

                        const postedJob = await postJob(extractedJobData, fullJobData, location)

                        console.log('   ' + postedJob.data.message + ' for location: ' + location)
                    } catch (error) {
                        console.log('   Failed to post job with title: ' + openaiJobPayload.title)
                        console.log(error.message)
                    }
                }
            } catch (error) {
                console.log('Failed to fetch jobs for location: ' + location)
                console.log(error.message)
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
runJobServicePipeline()


