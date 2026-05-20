import { NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  message: z.string().min(1, "Message is required").max(5000),
});

// TODO: Rate limiting - consider using upstash/ratelimit or a similar solution
// to prevent abuse. Example:
//   const ratelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, "60s") });
//   const { success } = await ratelimit.limit(ip);
//   if (!success) return NextResponse.json({ ... }, { status: 429 });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const { name, email, message } = result.data;

    // TODO: Integrate an email service (e.g. Resend, SendGrid, Nodemailer)
    // to forward the message to contact@damonguan.com.
    // Example with Resend:
    //   import { Resend } from "resend";
    //   const resend = new Resend(process.env.RESEND_API_KEY);
    //   await resend.emails.send({
    //     from: "onboarding@yourdomain.com",
    //     to: "contact@damonguan.com",
    //     subject: `Contact from ${name}`,
    //     text: `From: ${name} <${email}>\n\n${message}`,
    //     replyTo: email,
    //   });
    console.log("[contact]", { name, email, message });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, errors: [{ field: "_root", message: "Invalid request body" }] },
      { status: 400 }
    );
  }
}
