<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/67a6f8fa-f70a-45cf-adc5-2987c13b049e

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


App idea: In Malaysia, if wet markets have unsold leftover vegetables and fruits, it would be great if they could be distributed for free to people in need by NGO. Therefore, I decided to create an app to drive this initiative, simplify the process, and benefit the public.
Why not just post notifications in social media groups? Because organizers can use this app to distribute food in a more organized manner. For example, organizers can post the distribution date, time, location, and a fixed number of beneficiaries (roughly how many people can receive the produce) in advance.
The types of vegetables and fruits cannot be known in advance since the leftovers from the market are uncertain. Perhaps the organizer can attach some photos when posting.
The poster must include the organization's name and contact information.
The public can use this app to register for a specific distribution event. Once the quota is full, the app will stop accepting registrations. The benefit of fixing the number of participants is to prevent people from showing up and queuing, only to find out the quantity is insufficient and they have made a wasted trip.
People need to provide their Name, Phone Number, and IC during registration.
This app also allows registered individuals to know their estimated collection time. After registering, the app will calculate the timing based on the registration sequence and inform the person what time it will be their turn. Without this feature, everyone would arrive exactly at the start time and those further down the list would have to wait a long time in line. If people follow their assigned times, the predicted time provided by the app will be quite accurate, and they won't need to wait as long. Assumptions: Organizers will sort the produce and distribute it to the people; assume it takes about 8 minutes per person to receive their items.
The app allows users to select their preferred "Taman" areas (can follow more than one). When there is a distribution activity in or near these areas, they receive a push notification. Of course, when users register and log in, the homepage will show the latest posts from different organizers (events that haven't expired or are upcoming). Expired posts can be clearly displayed with special labels and colors. Users can use filters to choose State, District, and Taman to view activities, or use the search bar to search for keywords in posts.
Posters have a specific function: On the distribution day, the organizer can open the list of registered beneficiaries. People can "check-in" with the organizer, who can then mark those who attended. This data is used for records and statistics.
The app should support Malay, English, and Chinese.

UI should be simple, and easy for interaction and use, a relaxed look.
