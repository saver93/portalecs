'use client'

import { HelpCircle, BookOpen, MessageCircle, Phone, Mail, FileText, Video, Search } from 'lucide-react'
import { useState } from 'react'

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const faqItems = [
    {
      question: "Come posso creare una nuova richiesta di risorse?",
      answer: "Vai alla sezione 'Richieste Risorse' dal menu principale, clicca su 'Nuova Richiesta' e compila il modulo con le informazioni richieste."
    },
    {
      question: "Come posso modificare la mia password?",
      answer: "Clicca sul tuo profilo in alto a destra, vai su 'Profilo' e nella sezione 'Cambia Password' inserisci la nuova password desiderata."
    },
    {
      question: "Chi può approvare le richieste di risorse?",
      answer: "Solo gli utenti con ruolo Manager o Admin possono approvare o rifiutare le richieste di risorse."
    },
    {
      question: "Come posso vedere le scadenze dei veicoli?",
      answer: "Nella sezione 'Parco Auto' puoi vedere tutti i veicoli con le relative scadenze di assicurazione, bollo e revisione evidenziate con colori diversi."
    },
    {
      question: "Come funzionano le notifiche?",
      answer: "Le notifiche appaiono in tempo reale quando ci sono aggiornamenti importanti. Puoi cliccare sulla campanella per vederle tutte o andare nella pagina Notifiche."
    }
  ]

  const filteredFAQ = faqItems.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container-responsive py-8 animate-fadeIn">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Centro Assistenza</h1>
          <p className="text-text-secondary">Trova le risposte alle tue domande o contatta il supporto</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cerca nelle domande frequenti..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <a href="#" className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Documentazione</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Guide complete</p>
              </div>
            </div>
          </a>

          <a href="#" className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Video Tutorial</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Impara visivamente</p>
              </div>
            </div>
          </a>

          <a href="#" className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Changelog</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Novità e aggiornamenti</p>
              </div>
            </div>
          </a>
        </div>

        {/* FAQ Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Domande Frequenti</h2>
          
          {filteredFAQ.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">Nessuna domanda trovata per "{searchQuery}"</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQ.map((item, index) => (
                <details key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 group">
                  <summary className="p-6 cursor-pointer list-none flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="font-medium text-gray-900 dark:text-white">{item.question}</span>
                    </div>
                    <div className="ml-4 transform transition-transform group-open:rotate-180">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 dark:text-gray-300 pl-8">{item.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Hai ancora bisogno di aiuto?</h2>
          <p className="mb-6 opacity-90">Il nostro team di supporto è qui per aiutarti</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Chat Live</p>
                <p className="text-sm opacity-75">Lun-Ven 9:00-18:00</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-sm opacity-75">supporto@azienda.it</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Telefono</p>
                <p className="text-sm opacity-75">+39 02 1234567</p>
              </div>
            </div>
          </div>

          <button className="mt-6 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Contatta il Supporto
          </button>
        </div>
      </div>
    </div>
  )
}
