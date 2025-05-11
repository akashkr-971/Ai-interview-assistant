# 🤖 PrepWise

The AI Interview Assistant is a web application designed to help users prepare for job interviews with tailored mock interviews. It uses AI to generate questions based on various job roles and industries, and also offers the ability to purchase virtual coins for accessing premium features using **Razorpay** for payments.

This project is tailored for freshers who have just graduated for developing their interviewing skills

---

## 🔧 Tech Stack

- **Next.js 14** (App Router)
- **React**
- **Tailwind CSS** for styling
- **Razorpay** for payment gateway integration
- **Supabase** for backend and authentication
- **TypeScript** for better developer experience and type safety

---

## 🚀 Features

- **Mock Interview Generator**: Tailored interview questions for various job roles.
- **AI-Powered Responses**: Get real-time answers based on the role you're interviewing for.
- **Payment Integration**: Easily purchase virtual coins using Razorpay to unlock premium features (like advanced mock interviews, personalized feedback, and more).
- **User Authentication**: Sign up or log in using email or phone number via **Supabase**.
- **Virtual Coins**: Purchase coins to unlock premium interview features.
- **Coins Packages**: Buy packages like 1 Coin, 5 Coins, 10 Coins, and 50 Coins.

---

## 🛠 Setup

### Prerequisites

Before starting, ensure you have the following installed on your local machine:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) (Node package manager)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/akashkr-971/Ai-interview-assistant.git
   cd Ai-interview-assistant
   ```

2. **Install dependencies**:

   If you are using npm:

   ```bash
   npm install
   ```

   If you are using yarn:

   ```bash
   yarn install
   ```

3. **Set up environment variables**:

   Rename the `.env.example` file to `.env` and fill in the required values:

   ```bash
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
   NEXT_PUBLIC_RAZORPAY_KEY_SECRET=your_razorpay_secret
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   You can obtain the Razorpay Key ID by creating an account on the [Razorpay Dashboard](https://dashboard.razorpay.com/). Similarly, you can get Supabase credentials from your [Supabase Project Settings](https://app.supabase.io/).

4. **Run the development server**:

   ```bash
   npm run dev
   ```

   Or with yarn:

   ```bash
   yarn dev
   ```

   Now, you can open [http://localhost:3000](http://localhost:3000) to see the app in action!

---

## 💳 Razorpay Integration

- **Checkout Flow**: The app allows users to purchase virtual coins using Razorpay.

  - 1 Coin = ₹10
  - 5 Coins = ₹45
  - 10 Coins = ₹90
  - 50 Coins = ₹400

- **API Endpoint**: `/api/razorpay/createOrder`

  - This API is responsible for creating the Razorpay order and returning the order ID and amount.

- **Client-side Integration**: The checkout UI is triggered by a button in the product modal. On clicking the button, an order is created, and the Razorpay popup opens for the user to complete the payment.

- **Payment Success**: Once payment is completed, the payment details are logged and processed.

---

## 🔐 Authentication

- **Supabase Auth** is used to handle user registration and login. You can log in using either email/password or phone number authentication.
- After logging in, the user can access their profile and the coin purchase modal.

---

## 🤝 Contributing

Feel free to fork the project, submit issues, and create pull requests! Contributions are welcome.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🛠 Future Improvements

- Add advanced AI features to simulate technical interviews.
- Include more job roles and industries for mock interviews.
- Provide personalized feedback after interviews based on answers.
- Integrate additional payment options like UPI, Stripe, etc.

---

## 🎯 Acknowledgements

- **Razorpay** for payment gateway integration.
- **Supabase** for authentication and database.
- **OpenAI GPT-3** for AI-driven interview questions and responses.
- **Next.js** and **Tailwind CSS** for rapid development.

---

## 📞 Contact

## For any questions, feel free to reach out at `akashkr971@gmail.com`.
