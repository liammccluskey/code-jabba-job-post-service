import axios from 'axios'
import moment from 'moment'

const options = {
    method: 'GET',
    url: 'https://daily-international-job-postings.p.rapidapi.com/api/v2/jobs/search',
    params: {
        format: 'json',
        dateCreated: '2025-08-17',
        countryCode: 'us',
        title: 'software,programmer,frontend,fullstack,backend,java,react',
        city: '"new york"',
        page: '1'
    },
    headers: {
        'x-rapidapi-key': 'd763c4cc12msh1d985387135f2eap1b9955jsn3858a319f7f2',
        'x-rapidapi-host': 'daily-international-job-postings.p.rapidapi.com'
    }
}

try {
    const response = await axios.request(options)
    console.log(response.data)
} catch (error) {
    console.error(error)
}
