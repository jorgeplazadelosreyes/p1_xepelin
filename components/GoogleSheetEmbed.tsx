"use client";

const GOOGLE_SHEET_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL;

export default function GoogleSheetEmbed({ 
  }) {
    return (
      <div className="border rounded-md overflow-hidden mb-6">
        <iframe 
          src={GOOGLE_SHEET_URL}
          title={"Google Sheet"}
          className="w-full"
          style={{ height: "600px", border: "none" }}
          referrerPolicy="no-referrer"
          loading="lazy"
        ></iframe>
      </div>
    );
  }

