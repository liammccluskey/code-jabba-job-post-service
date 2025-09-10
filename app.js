import 'dotenv/config'
import cron from 'node-cron'

import { fetchJobs } from './src/jobsClient/index.js'
import { extractJobData } from './src/openaiClient/index.js'
import { postJob, archiveExpiredJobs } from './src/codeJabbaClient/index.js'
import { sendJobServiceResultsEmail } from './src/emailClient/index.js'
import {USCities} from './src/jobsClient/constants.js'
import { sleep } from './src/utils/index.js'

const runJobServicePipeline = async () => {
    let totalJobsCreatedCount = 0
    const jobsCreatedPerCity = {}

    try {
        for (let i = 0; i < USCities.length; i++) {
            const location = USCities[i]

            try {
                console.log('fetching jobs for location: ' + location)
                const jobs = await fetchJobs(location)

                for (let j = 0; j < jobs.length; j++) {
                    if (j == 0) jobsCreatedPerCity[location] = 0
                    
                    const {openaiJobPayload, fullJobData} = jobs[j]

                    try {
                        const extractedJobData = await extractJobData(openaiJobPayload)

                        const postedJob = await postJob(extractedJobData, fullJobData, location)

                        totalJobsCreatedCount++
                        jobsCreatedPerCity[location]++

                        console.log('   ' + postedJob.data.message + ' for location: ' + location)
                    } catch (error) {
                        console.log('   Failed to post job with title: ' + openaiJobPayload.title)
                        const errorMessage = error.response && error.response.data ? 
                            error.response.data.message
                            : error.message
                        console.log(errorMessage)
                    } finally {
                        await sleep(2)
                    }
                }
                await sleep(2)
            } catch (error) {
                console.log('Failed to fetch jobs for location: ' + location)
                console.log(error)
            }
        }

        await sendJobServiceResultsEmail(totalJobsCreatedCount, jobsCreatedPerCity)

        console.log('Job pipeline finished')
    } catch (error) {
        console.error('Pipeline failed:', error.message)
    }
}

// Schedule job to run every day at 1 AM EST
cron.schedule('0 0 1 * * *', () => {
    runJobServicePipeline()
    archiveExpiredJobs()
}, {
    scheduled: true,
    timezone: 'America/New_York'
})


