import OpenAI from 'openai'
import 'dotenv/config'

import {Languages, Skills} from './constants.js'

const openaiApi = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

const systemPrompt = `
    You are a job data extractor. Your job is to extract the following fields from the input job data and return the result as a json object. Make sure all the fields listed are the only fields present ( all must be present ) in the json object you return.
    # Fields to extract #
    - position: this field refers to the type of software engineer and is one of the following options ( frontend, backend, full-stack, embedded, quality-analysis, test). Use the "title" and "description" field you receive to determine this. Note that the string value you choose/return should be written/spelled exactly as it is in the input options you are given.
    - employmentType: one of the following options ( full-time, contract, part-time, internship ). Use the "description" and "employmentType" field you receive to determine this field. You should override the value given in the "employmentType" field you receive to fit one of the given input options. Note that the string value you choose/return should be written/spelled exactly as it is in the input options you are given.
    - setting: one of the following options ( on-site, remote, hybrid ). Use the "title" and "description" field you receive to determine this field. Note that the string value you choose/return should be written/spelled exactly as it is in the input options you are given.
    - experienceLevel: one of the following options ( entry, mid, senior, staff, principal ). Use the "title" and "description" field you receive to determine this field. Note that the string value you choose/return should be written/spelled exactly as it is in the input options you are given.
    - skills: send an array containing one or more of the following options [${Skills}]. This field refers to the coding skills necessary for the job, and you should use the "description" and "skills" field you receive to determine the content of this array field. Note that the items you send in this array should be written/spelled exactly as they are in the input options you receive.
    - languages: send an array containing one or more of the following options [${Languages}]. This field refers to the coding languages necessary for the job, and you should use the "description" and "skills" field you receive to determine the content of this array field. Note that the items you send in this array should be written/spelled exactly as they are in the input options you receive.
`

const enrichJobData = openaiJobData => {
    const ret = {...openaiJobData}
    const {experienceLevel} = ret

    switch (experienceLevel) {
        case 'entry':
            ret.experienceYears = ['0', '1', '2']
            break
        case 'mid':
            ret.experienceYears = ['2', '3',]
            break
        case 'senior':
            ret.experienceYears = ['4', '5']
            break
        case 'staff':
            ret.experienceYears = ['5', '6']
            break
        case 'principal':
            ret.experienceYears = ['6']
            break
    }

    delete ret.experienceLevel
    ret.experienceLevels = [experienceLevel]

    return ret
}

export const extractJobData = async inputJobData => {
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(inputJobData) }
    ]

    try {
        const response = await openaiApi.chat.completions.create({
            model: 'gpt-4.1-mini',
            messages,
            response_format: { type: 'json_object' }
        })
    
        const outputJobData = JSON.parse(response.choices[0].message.content)
        const enrichedJobData = enrichJobData(outputJobData)
    
        return enrichedJobData
    } catch (error) {
        console.log('Failed to extract job data from oopenai api.')
        console.log(error)
        throw error
    }
}