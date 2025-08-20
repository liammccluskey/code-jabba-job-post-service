import 'dotenv/config'
import cron from 'node-cron'
import { fetchJobs } from './src/jobsClient'
import { extractJobData } from './src/openaiClient'
import { postJob } from './src/codeJabbaClient'
import {USCities} from './src/jobsClient/constants'

// Job runner arrow function
const runJobPipeline = async () => {

    try {
        const jobs = await fetchJobs()
        console.log(`Fetched ${jobs.length} jobs`)

        for (const job of jobs) {
            try {
                const extracted = await extractJobData(job)
                const posted = await postJobToCodeJabba({ ...job, extracted })
                console.log(`Posted job: ${posted.id || posted.title}`)
            } catch (err) {
                console.error(`Error processing job ${job.id || job.title}:`, err.message)
            }
        }

        console.log('Job pipeline finished ✅')
    } catch (err) {
        console.error('Pipeline failed ❌:', err.message)
    }
}

// Schedule job to run every day at 1 AM EST
cron.schedule('0 1 * * *', () => {
    runJobPipeline()
}, {
    scheduled: true,
    timezone: 'America/New_York'
})

// Run immediately on startup (optional)
runJobPipeline()
