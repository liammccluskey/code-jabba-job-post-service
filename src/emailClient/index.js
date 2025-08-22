import nodemailer from 'nodemailer'
import 'dotenv/config'
import moment from 'moment'

const sendEmailNotification = async (emailSubject, emailBody, recipientEmail) => {
    let transporter 
    try {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.NOTIFICATIONS_EMAIL_SENDER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        })
    } catch (error) {
        console.log('Failed to create email transporter.')
        console.log(error)
        return
    }

    const mailOptions = {
        from: process.env.NOTIFICATIONS_EMAIL_SENDER,
        to: recipientEmail,
        subject: emailSubject,
        text: emailBody
    }

    try {
        const info = await transporter.sendMail(mailOptions)
        return !!info
    } catch (error) {
        console.log('Failed to send email.')
        console.log(error)
    }
}

// args - totalJobsCreated: number, jobsPerCity: {city(string): number}
export const sendJobServiceResultsEmail = async (totalJobsCreated, jobsPerCity) => {
    const emailSubject = `Job Service Results: ${moment().format('MM/DD')}`
    const recipientEmail = process.env.NOTIFICATIONS_EMAIL_RECIPIENT

    const jobsPerCityFormatted = Object.keys(jobsPerCity).map( city => {
        const jobsCount = jobsPerCity[city]

        return `\t${city} - ${jobsCount}`
    }).join('\n')
    
    const emailBody = `Here are the results for today's job service program:

Total jobs created: ${totalJobsCreated}

Jobs per city:

${jobsPerCityFormatted}
`

    await sendEmailNotification(emailSubject, emailBody, recipientEmail)
}