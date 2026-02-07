import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, Phone, Send, CheckCircle, AlertCircle } from 'lucide-react'
import Container from '@/components/layout/Container'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import SectionTitle from '@/components/ui/SectionTitle'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

interface FormData {
  name: string
  email: string
  organization: string
  subject: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  message?: string
}

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    organization: '',
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setIsSubmitted(true)

    // Reset form after showing success
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        organization: '',
        subject: '',
        message: '',
      })
    }, 500)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'contact@sparkguard.example',
      href: 'mailto:contact@sparkguard.example',
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'Location TBD',
      href: null,
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+1 (555) SPARK-00',
      href: 'tel:+15557727500',
    },
  ]

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
    >
      {/* Hero */}
      <section className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white py-20 lg:py-28">
        <Container>
          <motion.div variants={fadeInUp} className="max-w-3xl mx-auto text-center">
            <Badge variant="demo" className="mb-4">Contact Us</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-neutral-300">
              Have questions about SparkGuard? Want to learn more about our 
              approach to fire prevention technology? We'd love to hear from you.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Contact Section */}
      <section className="py-20 lg:py-28 bg-neutral-50">
        <Container>
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <motion.div variants={fadeInUp} className="lg:col-span-1 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                  Contact Information
                </h2>
                <p className="text-neutral-600">
                  Reach out to us through any of the following channels. 
                  We typically respond within 1-2 business days.
                </p>
              </div>

              {contactInfo.map((item) => {
                const Icon = item.icon
                return (
                  <Card key={item.label} padding="sm">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500">{item.label}</p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="font-medium text-neutral-900 hover:text-primary-600 transition-colors"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="font-medium text-neutral-900">{item.value}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}

              {/* Note about placeholder */}
              <div className="p-4 bg-secondary-50 rounded-lg border border-secondary-200">
                <p className="text-sm text-secondary-700">
                  <strong>Note:</strong> Contact information shown is placeholder data. 
                  Update with real contact details before deployment.
                </p>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div variants={fadeInUp} className="lg:col-span-2">
              <Card>
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-success-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-neutral-600 mb-6">
                      Thank you for reaching out. We'll get back to you soon.
                    </p>
                    <Badge variant="demo">Demo Mode - No actual email sent</Badge>
                    <div className="mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setIsSubmitted(false)}
                      >
                        Send Another Message
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate>
                    <h2 className="text-xl font-semibold text-neutral-900 mb-6">
                      Send us a Message
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-neutral-700 mb-2"
                        >
                          Name <span className="text-danger-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors ${
                            errors.name ? 'border-danger-500 bg-danger-50' : 'border-neutral-300'
                          }`}
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? 'name-error' : undefined}
                        />
                        {errors.name && (
                          <p id="name-error" className="mt-1 text-sm text-danger-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-neutral-700 mb-2"
                        >
                          Email <span className="text-danger-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors ${
                            errors.email ? 'border-danger-500 bg-danger-50' : 'border-neutral-300'
                          }`}
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? 'email-error' : undefined}
                        />
                        {errors.email && (
                          <p id="email-error" className="mt-1 text-sm text-danger-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.email}
                          </p>
                        )}
                      </div>

                      {/* Organization */}
                      <div>
                        <label
                          htmlFor="organization"
                          className="block text-sm font-medium text-neutral-700 mb-2"
                        >
                          Organization
                        </label>
                        <input
                          type="text"
                          id="organization"
                          name="organization"
                          value={formData.organization}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                        />
                      </div>

                      {/* Subject */}
                      <div>
                        <label
                          htmlFor="subject"
                          className="block text-sm font-medium text-neutral-700 mb-2"
                        >
                          Subject
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                        >
                          <option value="">Select a topic</option>
                          <option value="general">General Inquiry</option>
                          <option value="demo">Demo Request</option>
                          <option value="partnership">Partnership Opportunity</option>
                          <option value="technical">Technical Question</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="mt-6">
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-neutral-700 mb-2"
                      >
                        Message <span className="text-danger-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors resize-none ${
                          errors.message ? 'border-danger-500 bg-danger-50' : 'border-neutral-300'
                        }`}
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? 'message-error' : undefined}
                      />
                      {errors.message && (
                        <p id="message-error" className="mt-1 text-sm text-danger-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.message}
                        </p>
                      )}
                    </div>

                    {/* Submit */}
                    <div className="mt-6 flex items-center justify-between">
                      <Badge variant="demo" size="sm">
                        Demo Mode - Form not connected
                      </Badge>
                      <Button
                        type="submit"
                        variant="primary"
                        icon={Send}
                        isLoading={isSubmitting}
                      >
                        Send Message
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* FAQ Teaser */}
      <section className="py-20 lg:py-28 bg-white">
        <Container>
          <SectionTitle
            title="Frequently Asked Questions"
            subtitle="Quick answers to common questions about SparkGuard"
          />

          <motion.div
            variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
            className="max-w-3xl mx-auto space-y-4"
          >
            {[
              {
                q: 'Is SparkGuard currently operational?',
                a: 'SparkGuard is in development. The demo shows our planned capabilities with simulated data.',
              },
              {
                q: 'Does SparkGuard replace human decision-making?',
                a: 'No. SparkGuard provides advisory information only. All dispatch decisions require human approval.',
              },
              {
                q: 'What data sources are supported?',
                a: 'SparkGuard is designed to be compatible with various satellite data sources, weather APIs, and terrain data. See our Data Sources page for details.',
              },
              {
                q: 'How do I request a demo?',
                a: 'Use the contact form above or email us directly. Select "Demo Request" as your subject.',
              },
            ].map((faq, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card>
                  <h3 className="font-semibold text-neutral-900 mb-2">{faq.q}</h3>
                  <p className="text-neutral-600">{faq.a}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>
    </motion.div>
  )
}
