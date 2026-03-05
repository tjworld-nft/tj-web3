import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import About from "./components/About";
import Works from "./components/Works";
import Books from "./components/Books";
import Services from "./components/Services";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import { client } from "@/sanity/lib/client";
import { booksQuery, worksQuery, servicesQuery } from "@/sanity/lib/queries";
import type { SanityBook, SanityWork, SanityService } from "@/sanity/lib/types";

export default async function Home() {
  // Sanityからデータを取得（エラー時はフォールバックが表示される）
  let books: SanityBook[] = [];
  let works: SanityWork[] = [];
  let services: SanityService[] = [];

  try {
    [books, works, services] = await Promise.all([
      client.fetch<SanityBook[]>(booksQuery),
      client.fetch<SanityWork[]>(worksQuery),
      client.fetch<SanityService[]>(servicesQuery),
    ]);
  } catch (error) {
    console.log("Sanity fetch skipped (not configured yet):", error);
  }

  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <About />
        <Works works={works} />
        <Books books={books} />
        <Services services={services} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
