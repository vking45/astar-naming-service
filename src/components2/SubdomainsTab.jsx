import React from 'react';

const SubdomainItem = ({ avatar, name }) => (
  <div className="flex items-center mb-4 border-b border-gray-600 py-4">
    <img src={avatar} alt="avatar" className="w-10 h-10 rounded-full mr-4" />
    <div className="text-gray-100 font-semibold text-base">{name}</div>
  </div>
);

const SubdomainsTab = () => {
  // Replace the data in this object with your subdomain details
  const subdomains = [
    { avatar: 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTVJqKxALOWRfOWGeBkGd7fVvqvDtvWZ-Sis4u9Xc1I0IIpAwid', name: 'sub1.shubh.eth' },
    { avatar: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcT2jUdKJhKnlEf2FXJYiIT9JAFxUZs6rrSvmxOpQAIEmH5LPaL4', name: 'sub2.shubh.eth' },
    { avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQX8hG8E2wd6KP9X7ITpHWDbgMPzj1FdxiV0EK53Xj5ohto6S19', name: 'sub3.shubh.eth' },
  ];

  return (
    <div className="bg-gray-900 text-gray-100 font-poppins rounded-lg">
      <div className="container mx-auto py-8">
        <h2 className="text-2xl font-bold mb-6 ml-6">Subdomains</h2>
        <div className="bg-transparent rounded-lg p-6 shadow-md">
          {subdomains.map((subdomain, index) => (
            <SubdomainItem key={index} avatar={subdomain.avatar} name={subdomain.name} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubdomainsTab;
