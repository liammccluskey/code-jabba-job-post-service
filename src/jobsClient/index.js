import axios from 'axios'
import moment from 'moment'
import 'dotenv/config'

const getDateFormattedYYYYMMDD = () => {
    return moment().subtract(1, 'days').format('YYYY-MM-DD')
}

const getJobTitleOptionsFormatted = () => {
    return [
        'software',
        'programmer',
        'frontend',
        'backend',
        'fullstack',
        'react',
        'angular',
        'java'
    ].join(',')
}

const getJobQueryOptions = city => ({
    method: 'GET',
    url: process.env.JOB_API_URL,
    params: {
        format: 'json',
        dateCreated: getDateFormattedYYYYMMDD(),
        countryCode: 'us',
        title: getJobTitleOptionsFormatted(),
        city: `"${city}"`,
        page: '1'
    },
    headers: {
        'x-rapidapi-key': process.env.JOB_API_KEY,
        'x-rapidapi-host': process.env.JOB_API_HOST
    },
    timeout: 30*1000
})

// Transform data object structure to more concise format for sending to openai api
const transformJobData = (jobData, location) => {
    const {
        workType: [employmentType='N/A'],
        jsonLD: {
            title,
            description,
            skills=[],
            url,
            baseSalary: {
                value: {
                    minValue: salaryMin = 0,
                    maxValue: salaryMax = 0,
                    unitText: salaryFrequency = 'YEAR',
                } = {}
            } = {}
        },
        company,
        hasSalary=false,
    } = jobData

    const fullJobData = {
        // Static fields - not overwritten by openai job data
        title,
        description,
        companyName: company,
        location,
        applicationType: 'custom',
        applicationURL: url,
        salaryType: (hasSalary && salaryMin && salaryMax) ? 'range' : 'not-provided',
        salaryMin: (hasSalary && salaryMin) ? Number(salaryMin) : 0,
        salaryMax: (hasSalary && salaryMax) ? Number(salaryMax) : 0,
        salaryFrequency: (hasSalary && ['YEAR', 'HOUR', 'year', 'hour'].includes(salaryFrequency)) ? 
            salaryFrequency.toLowerCase() : 'year'
        ,
        // Dynamic fields - overwritten by openai job data
        employmentType: ['N/A', 'FlexTime'].includes(employmentType) ? 'fulltime' : employmentType,
    }

    const openaiJobPayload = {
        title,
        description,
        skills,
        employmentType: fullJobData.employmentType,
    }

    return {fullJobData, openaiJobPayload}
}

// fetch jobs from Job Data API
// args : location:string = 'city, STATE' - ex. 'New York, NY'
export const fetchJobs = async location => {
    const [city] = location.split(',')
    const jobQueryOptions = getJobQueryOptions(city)

    try {
        const res = await axios.request(jobQueryOptions)
        const jobs = res.data.result.map( job => transformJobData(job) )

        return jobs
    } catch (error) {
        console.log('Failed to fetch jobs.')
        const errorMessage = error.response && error.response.data ? 
            error.response.data.message
            : error.message
        console.log(errorMessage)
        throw error
    }
}
