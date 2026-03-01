import React, { useState } from 'react';
import { Mail, Phone, Globe } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    designation: '',
    company: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitted:', formData);
    // Add API or email submission logic here
  };

  return (
    <div className='pt-20'>
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Get in touch</h2>
        <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">
          We’re here to help! Whether you have a question, need more information, or just want to connect, feel
          free to reach out. Our team is ready to assist you and will get back to you as soon as possible.
        </p>

        <div className="grid lg:grid-cols-2 gap-20">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="fullName"
                required
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              />
              <input
                type="text"
                name="mobile"
                required
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              />
            </div>
            <input
              type="email"
              name="email"
              required
              placeholder="E-mail ID"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
            />
            <input
              type="text"
              name="designation"
              placeholder="Designation"
              value={formData.designation}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
            />
            <input
              type="text"
              name="company"
              placeholder="Name of the Company / Organisation"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
            />
            <textarea
              name="message"
              rows={4}
              placeholder="Leave us a message.."
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none"
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700"
            >
              Send Message
            </button>
          </form>

          {/* Contact Info */}
          <div className="space-y-10">
            <div>
              <div className="flex-col items-center mb-4">
                <Mail className="w-7 h-7 text-gray-700" />
                <h4 className="text-lg font-semibold text-gray-900">E-mail Support</h4>
              </div>
              <p className="text-gray-600 text-sm mb-1">Feel free to drop us an email</p>
              <a href="mailto:hello@wasteos.in" className="text-green-600 font-medium">
                hello@wasteos.in
              </a>
            </div>

            <div>
              <div className="flex-col items-center mb-4">
                <Phone className="w-7 h-7 text-gray-700" />
                <h4 className="text-lg font-semibold text-gray-900">Call Us Directly</h4>
              </div>
              <p className="text-gray-600 text-sm mb-1">Call our team Mon-Fri from 9am to 6pm</p>
              <a href="tel:+919876543210" className="text-green-600 font-medium">
                +91 98765 43210
              </a>
            </div>

            <div>
              <div className="flex-col items-center mb-4">
                <Globe className="w-7 h-7 text-gray-700" />
                <h4 className="text-lg font-semibold text-gray-900">Social Media</h4>
              </div>
              <p className="text-gray-600 text-sm mb-2">
                Follow us on social media for updates, promotions, and more!
              </p>
              <div className="flex space-x-3">
                <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
                  <img src="https://www.svgrepo.com/show/157006/linkedin.svg" alt="LinkedIn" className="w-7 h-7" />
                </a>
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/2048px-Instagram_icon.png" alt="Instagram" className="w-7 h-7" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
};

export default Contact;
