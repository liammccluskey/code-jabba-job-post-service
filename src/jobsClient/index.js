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
    }
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
                } = {}
            } = {}
        },
        company,
        hasSalary=false,
        minSalary,
    } = jobData

    const fullJobData = {
        title,
        description,
        skills,
        companyName: company,
        location,
        employmentType: ['N/A', 'FlexTime'].includes(employmentType) ? 'fulltime' : employmentType,
        applicationType: 'custom',
        applicationURL: url,
        salaryType: (hasSalary && salaryMin && salaryMax) ? 'range' : 'not-provided',
        salaryMin: (hasSalary && salaryMin) ? Number(salaryMin) : 0,
        salaryMax: (hasSalary && salaryMax) ? Number(salaryMax) : 0,
    }

    const openaiJobData = {
        title,
        description,
        skills,
        employmentType: fullJobData.employmentType,
    }

    return {fullJobData, openaiJobData}
}

// fetch jobs from Job Data API
// args : location:string = 'city, STATE' - ex. 'New York, NY'
export const fetchJobs = async location => {
    const [city] = location.split(',')
    const jobQueryOptions = getJobQueryOptions(city)

    try {
        const res = await axios.request(jobQueryOptions)
    
        const jobs = res.data.result

        return jobs
    } catch (error) {
        console.error(error)
    }
}
