import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { violationService } from '../../services/violationService';
import { VEHICLE_TYPE_ORDER, VIOLATION_TOPIC_ORDER } from '../utils/constants';

const LIMIT = 10;

export const useViolations = () => {
    const [vehicleType, setVehicleType] = useState('');
    const [topic, setTopic] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [topics, setTopics] = useState([]);

    const { data: filters } = useQuery({
        queryKey: ['violationFilters'],
        queryFn: violationService.getViolationFilters
    });

    useEffect(() => {
        if (filters) {
            const sortedVehicleTypes = [...VEHICLE_TYPE_ORDER];
            (filters.vehicle_types || []).forEach(type => {
                if (!sortedVehicleTypes.includes(type)) sortedVehicleTypes.push(type);
            });
            setVehicleTypes(sortedVehicleTypes.filter(type => (filters.vehicle_types || []).includes(type)));

            const sortedTopics = [...VIOLATION_TOPIC_ORDER];
            (filters.topics || []).forEach(tp => {
                if (!sortedTopics.includes(tp)) sortedTopics.push(tp);
            });
            setTopics(sortedTopics.filter(tp => (filters.topics || []).includes(tp)));
        }
    }, [filters]);

    const { data, isLoading } = useQuery({
        queryKey: ['violations', { vehicleType, topic, search, page }],
        queryFn: () => violationService.getAllViolations({
            vehicle_type: vehicleType,
            topic,
            search,
            page,
            limit: LIMIT
        }),
        keepPreviousData: true
    });

    const violations = data?.data || [];
    const totalPages = data?.totalPages || 1;

    const handleVehicleTypeChange = (e) => {
        setVehicleType(e.target.value);
        setPage(1);
    };

    const handleTopicChange = (e) => {
        setTopic(e.target.value);
        setPage(1);
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    return {
        vehicleType,
        topic,
        search,
        page,
        setPage,
        vehicleTypes,
        topics,
        violations,
        totalPages,
        isLoading,
        handleVehicleTypeChange,
        handleTopicChange,
        handleSearchChange
    };
}; 