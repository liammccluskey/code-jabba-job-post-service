import OpenAI from 'openai'
import 'dotenv/config'

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

const systemPrompt = 'You are a job data extractor. Extract skills, coding languages, employment type ( full-time | contract | part-time | internship ), and setting ( remote | on-site | hybrid ).'

export const extractJobData = async inputJobData => {
    const {
        title, 
        description,
        position,
        type,
        setting,
        skills, 
        languages, 
        experienceLevel, 
        location, 
    } = inputJobData

    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(jobData) }
    ]

    const response = await client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: messages,
        response_format: { type: 'json_object' }
    })

    const outputJobData = JSON.parse(response.choices[0].message.content)

    return outputJobData
}