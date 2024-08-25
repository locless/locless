'use client';
import { Container } from '@react-email/container';
import { Head } from '@react-email/head';
import { Heading } from '@react-email/heading';
import { Hr } from '@react-email/hr';
import { Html } from '@react-email/html';
import { Link } from '@react-email/link';
import { Section } from '@react-email/section';
import { Tailwind } from '@react-email/tailwind';
import { Text } from '@react-email/text';
import React from 'react';
import tailwindConfig from '../tailwind.config';

export type Props = {
  username: string;
  date: string;
};

export function WelcomeEmail() {
  return (
    <Tailwind config={tailwindConfig}>
      <Html className='font-sans text-zinc-800'>
        <Head />
        <Section className='bg-white'>
          <Container className='container mx-auto'>
            <Heading className='font-sans text-2xl text-semibold'>Welcome to Locless!</Heading>
            <Text>Hi there!</Text>
            <Text>I’m Igor, the creator of Locless, and I’m thrilled to welcome you to our community!</Text>
            <Text>
              At Locless, we're all about making your mobile app development process faster, easier, and more efficient.
              Whether you’re a seasoned developer or just starting, our tools are designed to help you bring your ideas
              to life with speed and precision.
            </Text>
            <Section>
              <Text className='font-semibold'>Here’s what you can expect: </Text>
              <Text>
                <li>
                  <Text>
                    Streamlined Development: Simplified workflows to get your app from concept to launch in record time.
                  </Text>
                </li>
                <li>
                  {' '}
                  <Text>Expert Support: Our team is here to assist you every step of the way.</Text>
                </li>
                <li>
                  {' '}
                  <Text>
                    Continuous Updates: We’re always improving our platform based on your feedback to ensure you have
                    the best experience possible.
                  </Text>
                </li>
              </Text>
            </Section>
            <Section>
              <Text className='font-semibold'>Here are some resources to get you started: </Text>
              <Text>
                <li>
                  <Link href='https://locless.com/docs'> Locless Docs </Link>
                </li>
                <li>
                  {' '}
                  <Link href='https://locless.com/discord'>Locless Discord </Link>
                </li>
              </Text>
            </Section>
            <Hr />
            <Text>
              Need help? Please reach out to <Link href='mailto:support@locless.com'>support@locless.com</Link> or just
              reply to this email. Ready to get started? <Link href='https://locless.com/app/projects'>Log in</Link> to
              your account and explore the possibilities. If you have any questions, feel free to{' '}
              <Link href='mailto:support@locless.com'>reach out</Link> — we’re here to help.
            </Text>
            <Text>Welcome aboard! Let’s create something amazing together.</Text>
            <Text>
              Best regards,
              <br />
              Igor
              <br />
              Founder & Creator of Locless
            </Text>
          </Container>
        </Section>
      </Html>
    </Tailwind>
  );
}

export default WelcomeEmail;
