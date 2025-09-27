import { LightningElement, track } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const OBJ_API_NAME = 'Promotion_Campaign__c';

export default class PromotionCampaignForm extends LightningElement {
    // tracked fields
    @track name = '';
    @track discountType = '';
    @track discountValue = null;
    @track startDate = '';
    @track endDate = '';
    @track productsIncluded = '';
    @track status = '';

    // simple local picklist options — replace or extend as needed
    get discountTypeOptions() {
        return [
            { label: 'Percentage', value: 'Percentage' },
            { label: 'Flat', value: 'Flat' },
            { label: 'BOGO', value: 'BOGO' }
        ];
    }

    get statusOptions() {
        return [
            { label: 'Planned', value: 'Planned' },
            { label: 'Active', value: 'Active' },
            { label: 'Expired', value: 'Expired' }
        ];
    }

    handleChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.type === 'number' ? (event.target.value === '' ? null : parseFloat(event.target.value)) : event.target.value;

        switch (field) {
            case 'Name':
                this.name = value;
                break;
            case 'Discount_Type__c':
                this.discountType = value;
                break;
            case 'Discount_Value__c':
                this.discountValue = value;
                break;
            case 'Start_Date__c':
                this.startDate = value;
                break;
            case 'End_Date__c':
                this.endDate = value;
                break;
            case 'Products_Included__c':
                this.productsIncluded = value;
                break;
            case 'Status__c':
                this.status = value;
                break;
            default:
                break;
        }
    }

    validate() {
        // Required name
        if (!this.name || this.name.trim() === '') {
            this.showToast('Error', 'Promotion Name is required.', 'error');
            return false;
        }

        // Discount non-negative if provided
        if (this.discountValue !== null && this.discountValue < 0) {
            this.showToast('Error', 'Discount Value cannot be negative.', 'error');
            return false;
        }

        // Start <= End if both provided
        if (this.startDate && this.endDate) {
            const s = new Date(this.startDate);
            const e = new Date(this.endDate);
            if (s > e) {
                this.showToast('Error', 'Start Date must be before or equal to End Date.', 'error');
                return false;
            }
        }

        return true;
    }

    handleSave() {
        if (!this.validate()) {
            return;
        }

        const fields = {
            Name: this.name,
        };

        // only set fields that have values (keeps record tidy)
        if (this.discountType) fields['Discount_Type__c'] = this.discountType;
        if (this.discountValue !== null && this.discountValue !== '') fields['Discount_Value__c'] = this.discountValue;
        if (this.startDate) fields['Start_Date__c'] = this.startDate;
        if (this.endDate) fields['End_Date__c'] = this.endDate;
        if (this.productsIncluded) fields['Products_Included__c'] = this.productsIncluded;
        if (this.status) fields['Status__c'] = this.status;

        const recordInput = { apiName: OBJ_API_NAME, fields };

        createRecord(recordInput)
            .then((cr) => {
                this.showToast('Success', `Promotion created (Id: ${cr.id})`, 'success');
                this.resetForm();
            })
            .catch((error) => {
                const message = (error && error.body && error.body.message) ? error.body.message : JSON.stringify(error);
                this.showToast('Error creating promotion', message, 'error');
            });
    }

    resetForm() {
        this.name = '';
        this.discountType = '';
        this.discountValue = null;
        this.startDate = '';
        this.endDate = '';
        this.productsIncluded = '';
        this.status = '';

        // clear inputs visually
        const inputs = this.template.querySelectorAll('lightning-input, lightning-textarea, lightning-combobox');
        if (inputs) {
            inputs.forEach(inp => {
                if (inp.type === 'number') inp.value = null;
                else inp.value = '';
            });
        }
    }

    showToast(title, message, variant = 'info') {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}
