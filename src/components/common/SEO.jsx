import React from 'react';
import { Helmet } from 'react-helmet-async';
import socialImg from '../../assets/social.png';

const SEO = ({ 
  title = "ArcPay | Secure UPI Payment Links & Instant Settlements",
  description = "Secure, high-conversion payment links for modern businesses. Empower your transactions with the most beautiful UPI checkout experience.",
  keywords = "UPI, payment link, ArcPay, secure payments, instant settlement, business payments, personalized payments",
  url = "https://pay.arcbyte.co",
  image = socialImg
}) => {
  const fullTitle = title.includes("ArcPay") ? title : `${title} | ArcPay`;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "ArcPay",
          "operatingSystem": "Web",
          "applicationCategory": "FinancialApplication",
          "description": description,
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "INR"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
