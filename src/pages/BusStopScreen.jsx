import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Spin, Table, Button, Card, Typography, Space, Tag, Alert, message, Skeleton } from 'antd';
import { ReloadOutlined, EnvironmentOutlined, NumberOutlined, ClockCircleOutlined } from '@ant-design/icons';
// import "./bus.css";
// import "./busstop.css";

const { Title, Text } = Typography;

// Helper function to calculate minutes difference from current time
const calculateMinutesFromNow = (targetTime, currentTime) => {
  if (!targetTime || !currentTime) return null;
  
  try {
    // Convert to string if it's not already
    const targetTimeStr = String(targetTime);
    const currentTimeStr = String(currentTime);
    
    // Parse time strings (format: "HH:MM:SS")
    const targetParts = targetTimeStr.split(':');
    const currentParts = currentTimeStr.split(':');
    
    if (targetParts.length < 3 || currentParts.length < 3) return null;
    
    const [targetHour, targetMinute, targetSecond] = targetParts.map(Number);
    const [currentHour, currentMinute, currentSecond] = currentParts.map(Number);
    
    // Convert to total minutes since midnight
    const targetTotalMinutes = targetHour * 60 + targetMinute + targetSecond / 60;
    const currentTotalMinutes = currentHour * 60 + currentMinute + currentSecond / 60;
    
    // Calculate difference in minutes
    let diffMinutes = Math.round(targetTotalMinutes - currentTotalMinutes);
    
    // If the time is for tomorrow (negative difference), add 24 hours
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60;
    }
    
    return diffMinutes;
  } catch (error) {
    console.error("Error calculating time difference:", error);
    return null;
  }
};

// Helper function to format time display safely
const formatTimeDisplay = (time) => {
  if (!time) return '';
  
  try {
    const timeStr = String(time);
    // Remove milliseconds if present
    return timeStr.split('.')[0];
  } catch (error) {
    return String(time);
  }
};

// Helper function to format minutes display
const formatMinutesDisplay = (minutes) => {
  if (minutes === null) return 'N/A';
  if (minutes === 0) return 'ARR';
  if (minutes < 0) return 'ARR';
  return minutes;
};

function BusStopScreen() {
  const [searchParams] = useSearchParams();
  const bus_stop_number = searchParams.get("bus_stop_number");

  const [busStop, setBusStop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Helper function to get minutes for a specific time
  const getMinutesForTime = (time) => {
    if (!time || !busStop?.current_time) return null;
    return calculateMinutesFromNow(time, busStop.current_time);
  };

  const columns = [
    {
      title: 'Service Number',
      dataIndex: 'bus_serviceno',
      key: 'bus_serviceno',
      render: (text) => (
        <Tag color="blue" style={{ fontSize: '16px', fontWeight: 'bold', padding: '4px 12px' }}>
          {text || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Arrival Time (min)',
      dataIndex: 'arrival_time',
      key: 'arrival_time',
      render: (text, record) => {
        const minutes = getMinutesForTime(text);
        const displayValue = formatMinutesDisplay(minutes);
        
        return (
          <Space direction="vertical" size={2}>
            <Space>
              <span style={{ fontSize: '15px', fontWeight: 500 }}>{displayValue}</span>
              {/* {minutes !== null && minutes > 0 && <Tag color="green">min</Tag>} */}
              {/* {minutes === 0 && <Tag color="orange">ARR</Tag>} */}
            </Space>
            {/* {text && (
              <Text type="secondary" style={{ fontSize: '11px' }}>
                {formatTimeDisplay(text)}
              </Text>
            )} */}
          </Space>
        );
      },
    },
    {
      title: 'Next Arrival (min)',
      dataIndex: 'next_arrival',
      key: 'next_arrival',
      render: (text, record) => {
        if (!text) {
          return <Text type="secondary">No scheduled arrival</Text>;
        }
        
        const minutes = getMinutesForTime(text);
        const displayValue = formatMinutesDisplay(minutes);
        
        return (
          <Space direction="vertical" size={2}>
            <Space>
              <span style={{ fontSize: '15px' }}>{displayValue}</span>
              {/* {minutes !== null && minutes > 0 && <Tag color="green">min</Tag>} */}
              {minutes === 0 && <Tag color="orange">ARR</Tag>}
            </Space>
            {/* <Text type="secondary" style={{ fontSize: '11px' }}>
              {formatTimeDisplay(text)}
            </Text> */}
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = async () => {
    try {
      console.log("Fetching bus data...");
      setLoading(true);

      const response = await fetch(
        `https://backend-vercel-zeta-eight.vercel.app/api/tracker/${bus_stop_number}/`
      );

      console.log("status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("data:", data);

      setBusStop(data);
      setLastUpdated(new Date());
      message.success('Bus data updated successfully');
    } catch (error) {
      console.error("Error fetching data:", error);
      setBusStop(null);
      message.error('Failed to fetch bus data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bus_stop_number) {
      fetchData();
    }
  }, [bus_stop_number]);

  // Generate skeleton rows for loading state
  const getSkeletonData = () => {
    return [1, 2, 3, 4, 5].map((key) => ({
      key: `skeleton-${key}`,
      bus_serviceno: <Skeleton.Input active size="small" style={{ width: 80 }} />,
      arrival_time: <Skeleton.Input active size="small" style={{ width: 120 }} />,
      next_arrival: <Skeleton.Input active size="small" style={{ width: 150 }} />,
    }));
  };

  // Get the bus services array from the response
  const getBusServices = () => {
    if (!busStop) return [];
    
    // Check if busStop has bus_details array (new structure)
    if (busStop.bus_details && Array.isArray(busStop.bus_details)) {
      return busStop.bus_details;
    }
    
    // Check if busStop is an array (API returns array directly)
    if (Array.isArray(busStop)) {
      return busStop;
    }
    
    // Check if busStop is an object with nested arrays
    if (typeof busStop === 'object') {
      return busStop.busService || busStop.services || busStop.buses || busStop.bussservice || [];
    }
    
    return [];
  };

  // Determine what data to show in table
  const tableData = () => {
    // Show skeleton only during initial load (loading true AND no data)
    if (loading && !busStop) {
      return getSkeletonData();
    }
    
    // Show actual data if we have it
    if (busStop) {
      const services = getBusServices();
      if (Array.isArray(services)) {
        return services.map((service, index) => ({
          ...service,
          key: service.id || service.bus_serviceno || index,
        }));
      }
    }
    
    return [];
  };

  // Get the count of services
  const getServiceCount = () => {
    if (!busStop) return 0;
    
    if (busStop.bus_details && Array.isArray(busStop.bus_details)) {
      return busStop.bus_details.length;
    }
    
    if (Array.isArray(busStop)) {
      return busStop.length;
    }
    
    if (typeof busStop === 'object') {
      const services = busStop.busService || busStop.services || busStop.buses || busStop.bussservice || [];
      return Array.isArray(services) ? services.length : 0;
    }
    
    return 0;
  };

  // Get stop name if available
  const getStopName = () => {
    if (!busStop) return null;
    
    if (typeof busStop === 'object') {
      return busStop.bus_stop_name || busStop.name || busStop.stop_name || null;
    }
    
    return null;
  };

  // Get current time from API
  const getCurrentTime = () => {
    if (!busStop) return null;
    
    if (typeof busStop === 'object' && busStop.current_time) {
      return formatTimeDisplay(busStop.current_time);
    }
    
    return null;
  };

  return (
    <div style={{ 
      padding: isMobile ? '16px' : '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card variant="borderless" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <Space
            direction={isMobile ? "vertical" : "horizontal"}
            style={{ width: '100%', justifyContent: 'space-between' }}
          >
            <Space>
              <Title level={isMobile ? 3 : 2} style={{ margin: 0 }}>
                Live Bus Arrival Time
              </Title>
              {/* {!loading && getStopName() && (
                <Tag color="purple" style={{ marginLeft: '8px' }}>
                  {getStopName()}
                </Tag>
              )}
              {loading && !busStop && (
                <Skeleton.Input active size="small" style={{ width: 120, marginLeft: '8px' }} />
              )} */}
            </Space>
            
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={fetchData}
              size={isMobile ? "middle" : "large"}
              loading={loading}
            >
            
            </Button>
          </Space>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            marginTop: '24px'
          }}>
            <Card size="small" style={{ background: '#f5f5f5' }}>
              <Space>
                <NumberOutlined style={{ color: '#1890ff' }} />
                <Text type="secondary">Stop - </Text>
                <Text strong>{bus_stop_number}</Text>
                 {!loading && getStopName() && (
          <>
            <Text type="secondary" style={{ marginLeft: '8px' }}>-</Text>
            <Text strong>{getStopName()}</Text>
          </>
        )}
              </Space>
            </Card>
            
            {/* Current Time Display */}
            {!loading && getCurrentTime() && (
              <Card size="small" style={{ background: '#f5f5f5' }}>
                <Space>
                  <ClockCircleOutlined style={{ color: '#52c41a' }} />
                  <Text type="secondary">Last Update: {lastUpdated.toLocaleTimeString()}</Text>
                  {/* <Text strong>{getCurrentTime()}</Text> */}
                </Space>
              </Card>
            )}
          </div>
        </Card>

        <Card 
        
          variant="borderless"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
        >
          <Table
            columns={columns}
            dataSource={tableData()}
            pagination={false}
            size={isMobile ? "small" : "middle"}
            bordered
            style={{ 
              background: 'white',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
            scroll={{ x: 'max-content' }}
            locale={{
              emptyText: loading ? (
                <div style={{ padding: '20px' }}>
                  <Spin tip="Loading bus services..." />
                </div>
              ) : 'No services available'
            }}
          />
        </Card>

        {/* {lastUpdated && (
          <Text type="secondary" style={{ display: 'block', textAlign: 'right' }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Text>
        )} */}
      </Space>
    </div>
  );
}

export default BusStopScreen;
