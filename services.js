class ServicesManager {
    constructor(options) {
        this.apiUrl = options.apiUrl;
        this.whatsappNumber = options.whatsappNumber || '919946280727';
        this.servicesPerPage = options.servicesPerPage || 9;
        this.isAllServicesPage = options.isAllServicesPage || false;
        this.services = [];
        this.filteredServices = [];
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.servicesListElement = document.getElementById('services-list');
        this.modal = document.getElementById('service-modal');
        this.loadMoreBtn = document.getElementById('load-more-btn');
        this.searchInput = document.getElementById('service-search');
        this.categoryTabs = document.querySelectorAll('.services-tab');

        this.init();
    }

    async init() {
        // Reset the body overflow on page load to fix the scroll issue
        document.body.style.overflow = 'auto';
        
        try {
            this.showLoading();
            await this.fetchServices();
            this.setupEventListeners();
            this.filterAndRenderServices();
            console.log('ServicesManager initialized successfully');
        } catch (error) {
            console.error('Error initializing ServicesManager:', error);
            this.showError('Failed to load services. Please try again later.');
        }
    }

    async fetchServices() {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                cache: 'no-cache'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.message || 'API returned error');
            }

            if (data && Array.isArray(data) && data.length > 0) {
                this.services = data.map(service => ({
                    name: service['Service Name'],
                    description: service['Description'],
                    category: service['Category'],
                    icon: service['Icon'],
                    documents: this.parseDocuments(service['Documents']),
                    keywords: service['Keywords']
                }));
            } else {
                throw new Error('No valid data received from API');
            }
        } catch (error) {
            console.error('❌ Error fetching services:', error);
            console.log('🔄 Falling back to sample data');
            this.loadSampleData();
        }
    }

    parseDocuments(documentsString) {
        if (!documentsString) return [];
        return documentsString
            .split(',')
            .map(doc => doc.trim())
            .filter(doc => doc.length > 0);
    }

    // Fallback sample data in case API fails
    loadSampleData() {
        this.services = [
            {
                name: 'INCOME CERTIFICATE',
                description: 'Kerala state documentation service for INCOME CERTIFICATE...',
                category: 'certificates',
                icon: 'fas fa-certificate',
                documents: ['RATION CARD', 'AADHAR/ANY ID CARD', 'LAND TAX RECEIPT', 'SALARY CERTIFICATE (IN CASE OF EMPLOYEES)', 'INCOME AFFIDAVIT'],
                keywords: 'income certificate application'
            },
            {
                name: 'COMMUNITY / CASTE CERTIFICATE',
                description: 'Kerala state documentation service for COMMUNITY / CASTE CERTIFICATE...',
                category: 'certificates',
                icon: 'fas fa-certificate',
                documents: ['RATION CARD', 'SCHOOL CERTIFICATE', 'PARENT\'S SCHOOL CERTIFICATE', 'AADHAR/ANY ID PROOF'],
                keywords: 'community caste certificate application'
            },
            {
                name: 'RESIDENTIAL / RESIDENCE CERTIFICATE',
                description: 'Kerala state documentation service for RESIDENTIAL / RESIDENCE CERTIFICATE...',
                category: 'certificates',
                icon: 'fas fa-home',
                documents: ['RATION CARD', 'AADHAR/ANY ID PROOF', 'LAND TAX RECEIPT'],
                keywords: 'residential residence certificate application'
            },
            {
                name: 'SURVIVAL CERTIFICATE',
                description: 'Kerala state documentation service for SURVIVAL CERTIFICATE...',
                category: 'certificates',
                icon: 'fas fa-heartbeat',
                documents: ['AADHAR CARD', 'FAMILY MEMBERS LIST', 'DECLARATION AFFIDAVIT'],
                keywords: 'survival certificate application'
            },
            {
                name: 'LEGAL HEIR CERTIFICATE',
                description: 'Kerala state documentation service for LEGAL HEIR CERTIFICATE...',
                category: 'certificates',
                icon: 'fas fa-gavel',
                documents: ['DEATH CERTIFICATE', 'LEGAL HEIR DECLARATION AFFIDAVIT', 'RATION CARD', 'ID PROOF OF ALL LEGAL HEIRS'],
                keywords: 'legal heir certificate application'
            },
            {
                name: 'RE MARRIAGE CERTIFICATE',
                description: 'Kerala state documentation service for RE MARRIAGE CERTIFICATE...',
                category: 'certificates',
                icon: 'fas fa-ring',
                documents: ['DEATH CERTIFICATE OF PREVIOUS SPOUSE', 'PREVIOUS MARRIAGE CERTIFICATE', 'AADHAR/ANY ID PROOF'],
                keywords: 're-marriage certificate application'
            },
            {
                name: 'REGISTRATION OF MARRIAGE (HINDU, CHRISTIAN, MUSLIM)',
                description: 'Registration service for various marriages...',
                category: 'registrations',
                icon: 'fas fa-file-alt',
                documents: ['MARRIAGE INVITATION', 'AADHAR CARD OF BOTH BRIDE AND GROOM', 'WITNESS ID PROOFS'],
                keywords: 'marriage registration'
            },
            {
                name: 'AADHAR LINKING TO BANK ACCOUNT',
                description: 'Service to link your Aadhar to your bank account...',
                category: 'applications',
                icon: 'fas fa-link',
                documents: ['AADHAR CARD', 'BANK PASSBOOK'],
                keywords: 'aadhar bank link application'
            },
            {
                name: 'RATION CARD SERVICE',
                description: 'Various services related to your Ration Card...',
                category: 'others',
                icon: 'fas fa-credit-card',
                documents: ['AADHAR CARD OF ALL FAMILY MEMBERS'],
                keywords: 'ration card services'
            }
        ];
    }

    setupEventListeners() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.debounce((e) => {
                this.searchQuery = e.target.value.toLowerCase().trim();
                this.filterAndRenderServices();
            }, 300));
        }

        if (this.categoryTabs) {
            this.categoryTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    this.categoryTabs.forEach(t => t.classList.remove('active'));
                    e.target.classList.add('active');
                    this.currentCategory = e.target.getAttribute('data-category');
                    this.filterAndRenderServices();
                });
            });
        }
        
        // Modal close handlers
        const modalCloseBtn = document.getElementById('modal-close-btn');
        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', () => this.closeModal());
        }

        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });
        }
    }

    debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    filterAndRenderServices() {
        this.filteredServices = this.services.filter(service => {
            const matchesCategory = this.currentCategory === 'all' || service.category.toLowerCase() === this.currentCategory.toLowerCase();
            const matchesSearch = this.searchQuery === '' ||
                                  service.name.toLowerCase().includes(this.searchQuery) ||
                                  service.description.toLowerCase().includes(this.searchQuery) ||
                                  (service.keywords && service.keywords.toLowerCase().includes(this.searchQuery));
            return matchesCategory && matchesSearch;
        });
        
        this.renderServices();
    }

    renderServices() {
        if (!this.servicesListElement) {
            console.error('Services list container not found');
            return;
        }

        this.servicesListElement.innerHTML = '';
        if (this.filteredServices.length === 0) {
            this.showNoServicesFound();
            return;
        }

        let servicesToShow;
        if (this.isAllServicesPage) {
            servicesToShow = this.filteredServices;
            if (this.loadMoreBtn) this.loadMoreBtn.style.display = 'none';
        } else {
            servicesToShow = this.filteredServices.slice(0, this.servicesPerPage);
            if (this.loadMoreBtn) {
                this.loadMoreBtn.style.display = 'block';
                this.loadMoreBtn.addEventListener('click', () => window.location.href = 'all-services.html');
            }
        }

        const servicesHTML = servicesToShow.map(service => this.createServiceCard(service)).join('');
        this.servicesListElement.innerHTML = servicesHTML;
        this.addCardClickHandlers();
    }

    createServiceCard(service) {
        const whatsappLink = `https://wa.me/${this.whatsappNumber}?text=Hi, I would like to know more about the ${service.name} service.`;
        return `
            <div class="service-item service-card" data-service-name="${service.name}" data-aos="zoom-in" data-aos-delay="100">
                <div class="service-icon">
                    <i class="${service.icon}"></i>
                </div>
                <h3 class="service-title">${service.name}</h3>
                <p class="service-desc">${service.description.substring(0, 100)}...</p>
                <div class="service-tags">
                    <span class="tag">${service.category}</span>
                </div>
                <div class="service-cta">
                    <a href="${whatsappLink}" class="service-cta-btn" target="_blank" onclick="event.stopPropagation()">
                        <i class="fas fa-paper-plane"></i> Get Service
                    </a>
                </div>
            </div>
        `;
    }

    addCardClickHandlers() {
        const serviceCards = this.servicesListElement.querySelectorAll('.service-card');
        serviceCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const serviceName = e.currentTarget.getAttribute('data-service-name');
                const service = this.services.find(s => s.name === serviceName);
                if (service) {
                    this.showModal(service);
                }
            });
        });
    }

    showModal(service) {
        if (!this.modal) return;
        
        document.getElementById('modal-service-title').textContent = service.name;
        document.getElementById('modal-service-description').textContent = service.description;

        const documentsList = document.getElementById('modal-documents-list');
        documentsList.innerHTML = service.documents.map(doc => `
            <li class="documents-item"><i class="fas fa-check-circle"></i> ${doc}</li>
        `).join('');
        
        const whatsappLink = `https://wa.me/${this.whatsappNumber}?text=Hi, I would like to know more about the ${service.name} service.`;
        document.getElementById('modal-whatsapp-link').href = whatsappLink;

        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        if (this.modal) {
            this.modal.classList.remove('active');
        }
        document.body.style.overflow = 'auto';
    }

    showLoading() {
        if (!this.servicesListElement) return;
        this.servicesListElement.innerHTML = `
            <div class="services-loading">
                <div class="loading-spinner"></div>
                <h3>Loading Services...</h3>
            </div>
        `;
    }
    
    showError(message) {
        if (!this.servicesListElement) return;
        this.servicesListElement.innerHTML = `
            <div class="services-error">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    }

    showNoServicesFound() {
        if (!this.servicesListElement) return;
        this.servicesListElement.innerHTML = `
            <div class="no-services-found">
                <i class="fas fa-search"></i>
                <h3>No Services Found</h3>
                <p>Try adjusting your search or filter criteria</p>
            </div>
        `;
    }
}

(function initServicesManager() {
  const start = () => {
    const isAllServicesPage = window.location.pathname.endsWith('all-services.html');
    // IMPORTANT: add ?type=services so GAS routes it
    const apiUrl = 'https://script.google.com/macros/s/AKfycbx3BRtrM6u6YbHVkl-MxnDLWrMvcteAX3U2pgRmj12cHRkCblzCpEM0h0h2Dg2XuNmrQA/exec?type=services';
    new ServicesManager({ apiUrl, isAllServicesPage });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();