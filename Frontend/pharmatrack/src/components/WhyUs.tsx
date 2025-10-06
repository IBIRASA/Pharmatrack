import React from "react";
import { Clock, MapPin, HeartPulse } from "lucide-react";

const WhyUs = () => {
  const features = [
    {
      icon: <Clock className="w-10 h-10 text-teal-600" />,
      title: "Real-Time Access",
      desc: "Instant updates on which pharmacies have your medicine in stock."
    },
    {
      icon: <MapPin className="w-10 h-10 text-teal-600" />,
      title: "Location-Based Search",
      desc: "Find the closest pharmacy with directions."
    },
    {
      icon: <HeartPulse className="w-10 h-10 text-teal-600" />,
      title: "Better Healthcare Outcomes",
      desc: "Faster access to medicines improves health results."
    }
  ];

  return (
<section className=" bg-gray-50 text-center">
  <div className="py-15 px-8">
  <h2 className="text-4xl font-bold text-gray-800 mb-10">Why Us</h2>
  <p className="text-gray-600  max-w-2xl mx-auto ">
          Connecting patients with nearby pharmacies for faster, easier care.
Find trusted pharmacies in your area, check medicine availability, and save time on every visit. PharmacyTrack helps you access the care you need quickly and conveniently.
        </p>
  <div className="grid gap-12 grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 px-40 py-20">
    {features.map((f, i) => (
      <div key={i} className="flex flex-col items-center">
        <div className="bg-teal-800 p-4 rounded-full shadow-sm">
          {React.cloneElement(f.icon, { color: "white", size: 32 })}
        </div>
        <h3 className="mt-4 font-semibold text-lg">{f.title}</h3>
        <p className="mt-2 text-gray-600 max-w-sm">{f.desc}</p>
      </div>
    ))}
  </div>
  </div>
</section>
  );
};

export default WhyUs;
