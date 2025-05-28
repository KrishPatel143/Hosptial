import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {Ambulance, Building2, ChevronRight, Phone, Plus, User } from "lucide-react";

const emergencyContacts = [
  {
    id: 1,
    name: "Emergency Ambulance",
    number: "911",
    icon: Ambulance,
  },
  {
    id: 2,
    name: "City General Hospital",
    number: "+1 (555) 234-5678",
    icon: Building2,
  },
  {
    id: 3,
    name: "Dr. Sarah Johnson (Primary Care)",
    number: "+1 (555) 987-6543",
    icon: User,
  },
  {
    id: 4,
    name: "Jane Doe (Emergency Contact)",
    number: "+1 (555) 123-4567",
    icon: User,
  },
];

const faqs = [
    {
        question: "How do I reschedule an appointment?",
        answer:
          "To reschedule an appointment, go to the Appointments section, find the appointment you want to reschedule, and click the 'Reschedule' button. You'll be able to select a new date and time based on availability.",
      },
      {
        question: "How can I upload my medical reports?",
        answer:
          "You can upload your medical reports in the Medical Reports section. Click on the 'Upload New Report' button, fill in the required details, and upload your file. We accept PDF, JPG, and PNG formats up to 10MB in size.",
      },
      {
        question: "What should I do if I need immediate medical attention?",
        answer:
          "If you need immediate medical attention, please call emergency services at 911 or your local emergency number. For non-life-threatening situations, you can contact your primary care physician or visit an urgent care facility.",
      },
      {
        question: "How do I update my personal information?",
        answer:
          "You can update your personal information in the Profile section. Click on the 'Edit Profile' button, make the necessary changes, and click 'Save Changes' to update your information.",
      },
      {
        question: "Can I share my medical records with another doctor?",
        answer:
          "Yes, you can share your medical records with another doctor. In the Medical Reports section, select the reports you want to share, click on the 'Share' option, and enter the doctor's email address or select from your list of healthcare providers.",
      },
      {
        question: "How secure is my health information on this platform?",
        answer:
          "Your health information is protected by industry-standard encryption and security measures. We comply with all relevant healthcare privacy regulations, including HIPAA. Only authorized healthcare providers and yourself have access to your information.",
      },
];

const EmergencyContactsSection = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Emergency Contacts</CardTitle>
              <CardDescription>Important contacts for emergency situations</CardDescription>
            </div>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" /> Add Contact
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {emergencyContacts.map((contact) => (
              <Card key={contact.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="bg-primary/10 p-4 flex items-center justify-center">
                      <contact.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="p-4 flex-1">
                      <h3 className="font-medium">{contact.name}</h3>
                      <p className="text-sm text-muted-foreground">{contact.number}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="mr-2">
                      <Phone className="h-4 w-4" />
                      <span className="sr-only">Call</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Find answers to common questions</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Health Resources</CardTitle>
          <CardDescription>Useful links and resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {["COVID-19 Information", "Mental Health Resources", "Nutrition Guidelines", "Medication Information"].map((resource, index) => (
              <div key={index} className={`flex items-center justify-between ${index !== 3 ? "border-b pb-4" : ""}`}>
                <div>
                  <h3 className="font-medium">{resource}</h3>
                  <p className="text-sm text-muted-foreground">{resource === "COVID-19 Information" ? "Latest updates and guidelines" : resource === "Mental Health Resources" ? "Support and counseling services" : resource === "Nutrition Guidelines" ? "Healthy eating and diet plans" : "Drug interactions and side effects"}</p>
                </div>
                <Button variant="ghost" size="sm">
                  Visit <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyContactsSection;
