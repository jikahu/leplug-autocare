export type FaqCategoryId = "how-to-buy" | "delivery" | "returns" | "payment" | "warranty";

export type FaqCategory = { id: FaqCategoryId; label: string };

export const faqCategories: FaqCategory[] = [
  { id: "how-to-buy", label: "How to Buy" },
  { id: "delivery", label: "Delivery" },
  { id: "returns", label: "Returns" },
  { id: "payment", label: "Payment" },
  { id: "warranty", label: "Warranty" },
];

export type Faq = {
  id: string;
  category: FaqCategoryId;
  question: string;
  answer: string;
};

export const faqs: Faq[] = [
  {
    id: "how-to-buy-1",
    category: "how-to-buy",
    question: "How do I order from LePlug Autocare?",
    answer:
      "Browse or search for what you need, add it to your cart, then head to checkout. You'll enter your delivery details, pick a delivery zone, choose a payment method, and review your order before placing it. You don't need an account to check out, but creating one lets you track order history and save addresses.",
  },
  {
    id: "how-to-buy-2",
    category: "how-to-buy",
    question: "How do I know a part fits my car?",
    answer:
      "Product pages list compatible vehicle makes where relevant. If you're not sure a part fits your specific model, contact us with your car's make, model, and year before ordering.",
  },
  {
    id: "delivery-1",
    category: "delivery",
    question: "What are your delivery zones and fees?",
    answer:
      "We deliver across Nairobi Metro for a flat KSh 300, and outside Nairobi for a flat KSh 600. Orders over KSh 5,000 qualify for free delivery, regardless of zone.",
  },
  {
    id: "delivery-2",
    category: "delivery",
    question: "How long does delivery take?",
    answer:
      "Most Nairobi Metro orders arrive within 1-2 business days of dispatch. Deliveries outside Nairobi may take longer depending on the destination.",
  },
  {
    id: "returns-1",
    category: "returns",
    question: "Can I return a product?",
    answer:
      "Yes — unused items in their original packaging can be returned within 7 days of delivery. See our Returns & Refunds Policy for the full process.",
  },
  {
    id: "returns-2",
    category: "returns",
    question: "What if my order arrives damaged or wrong?",
    answer:
      "Contact us with your order number and a photo of the item as soon as you notice the issue. We'll sort a replacement or refund — this doesn't count against the standard return window.",
  },
  {
    id: "payment-1",
    category: "payment",
    question: "What payment methods do you accept?",
    answer:
      "M-Pesa, card, and cash on delivery. You'll choose your method at checkout, and prices shown are final and VAT-inclusive.",
  },
  {
    id: "payment-2",
    category: "payment",
    question: "How do you protect my payment details?",
    answer:
      "We don't store your card details on our own servers. M-Pesa payments are confirmed directly on your phone via STK push, so you're always the one approving the transaction.",
  },
  {
    id: "warranty-1",
    category: "warranty",
    question: "Do products come with a warranty?",
    answer:
      "Parts and accessories are backed by manufacturer warranty where applicable — check the individual product page for specifics, or ask us before you order.",
  },
  {
    id: "warranty-2",
    category: "warranty",
    question: "How do I make a warranty claim?",
    answer:
      "Contact us with your order number and a description of the issue. We'll guide you through the manufacturer's warranty process for that product.",
  },
];
