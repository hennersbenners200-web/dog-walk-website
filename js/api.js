// api.js
// Frontend API client - talks to our secure backend function

class AirtableAPI {
  constructor() {
    // Use Netlify function endpoint
    this.baseURL = '/.netlify/functions/airtable';
  }

  // Generic GET request
  async getRecords(tableName, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseURL}/${tableName}${queryString ? '?' + queryString : ''}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.records;
    } catch (error) {
      console.error('Error fetching records:', error);
      throw error;
    }
  }

  // Create a new record
  async createRecord(tableName, fields) {
    const url = `${this.baseURL}/${tableName}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create record');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating record:', error);
      throw error;
    }
  }

  // Update a record
  async updateRecord(tableName, recordId, fields) {
    const url = `${this.baseURL}/${tableName}/${recordId}`;
    
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update record');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating record:', error);
      throw error;
    }
  }

  // Delete a record
  async deleteRecord(tableName, recordId) {
    const url = `${this.baseURL}/${tableName}/${recordId}`;
    
    try {
      const response = await fetch(url, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete record');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting record:', error);
      throw error;
    }
  }

  // Get bookings for a specific date
  async getBookingsForDate(date) {
    const formula = `{Date} = '${date}'`;
    return this.getRecords('Bookings', {
      filterByFormula: formula
    });
  }

  // Get all services
  async getServices() {
    return this.getRecords('Services');
  }

  // Check if email exists in Clients table
  async findClientByEmail(email) {
    const formula = `{Email} = '${email}'`;
    const records = await this.getRecords('Clients', {
      filterByFormula: formula
    });
    return records.length > 0 ? records[0] : null;
  }

  // Get dogs for a specific client
  async getDogsForClient(clientRecordId) {
    const formula = `FIND('${clientRecordId}', {Owner})`;
    return this.getRecords('Dogs', {
      filterByFormula: formula
    });
  }

  // Get bookings for a specific client
  async getBookingsForClient(clientRecordId) {
    const formula = `FIND('${clientRecordId}', {Client})`;
    const bookings = await this.getRecords('Bookings', {
      filterByFormula: formula,
      sort: [{field: 'Date', direction: 'desc'}]
    });
    return bookings;
  }
}

// Initialize API instance
const airtable = new AirtableAPI();