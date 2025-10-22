export type College = {
  id: string;
  name: string;
  location: string;
  eventCount: number;
};

export const locations = ['Chennai', 'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Punjab'];

export const colleges: College[] = [
    { id: 'srmist-chennai', name: 'SRM Institute of Science and Technology', location: 'Chennai', eventCount: 9 },
    { id: 'iitm-chennai', name: 'IIT Madras', location: 'Chennai', eventCount: 4 },
    { id: 'loyola-chennai', name: 'Loyola College', location: 'Chennai', eventCount: 2 },
    { id: 'iitd-delhi', name: 'IIT Delhi', location: 'Delhi', eventCount: 5 },
    { id: 'du-delhi', name: 'Delhi University', location: 'Delhi', eventCount: 3 },
    { id: 'nsut-delhi', name: 'Netaji Subhas University of Technology', location: 'Delhi', eventCount: 2 },
    { id: 'iitb-mumbai', name: 'IIT Bombay', location: 'Mumbai', eventCount: 5 },
    { id: 'spit-mumbai', name: 'Sardar Patel Institute of Technology', location: 'Mumbai', eventCount: 2 },
    { id: 'iisc-bangalore', name: 'Indian Institute of Science', location: 'Bangalore', eventCount: 3 },
    { id: 'pes-bangalore', name: 'PES University', location: 'Bangalore', eventCount: 2 },
    { id: 'iiith-hyderabad', name: 'IIIT Hyderabad', location: 'Hyderabad', eventCount: 3 },
    { id: 'bits-hyderabad', name: 'BITS Pilani, Hyderabad Campus', location: 'Hyderabad', eventCount: 2 },
    { id: 'iit-ropar', name: 'IIT Ropar', location: 'Punjab', eventCount: 2 },
    { id: 'thapar-patiala', name: 'Thapar Institute of Engineering and Technology', location: 'Punjab', eventCount: 2 },
];
