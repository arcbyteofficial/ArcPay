import React from 'react';
import { Helmet } from 'react-helmet-async';
import socialImg from '../../assets/social.png';

const SEO = ({
  title = "ArcPay | The Easiest Way to Get Paid Instantly",
  description = "Create simple payment links and get money directly in your bank account. No fees, no complicated setups.",
  keywords = "UPI, payment link, ArcPay, get paid, instant bank transfer, business payments, easy checkout",
  url = "https://pay.arcbyte.co",
  image = socialImg,
  type = "website",
  noindex = false
}) => {
  const fullTitle = title.includes("ArcPay") ? title : `${title} | ArcPay`;

  return (
    <Helmet>
      {/* Indexing Control */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="ArcPay" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@arcbyteofficial" />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "ArcPay",
          "operatingSystem": "Web",
          "applicationCategory": "FinancialApplication",
          "description": description,
          "url": url,
          "image": image,
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "INR"
          },
          "author": {
            "@type": "Organization",
            "name": "ArcByte Official",
            "url": "https://arcbyte.co"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
