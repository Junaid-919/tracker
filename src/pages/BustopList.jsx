import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Spin, Card, Button, Space, Typography, Row, Col, Alert, Tag, Divider, message, Skeleton } from "antd";
import { ReloadOutlined, EnvironmentOutlined, NumberOutlined, ClockCircleOutlined } from "@ant-design/icons";
// import "./bus.css";
// import "./busstop.css";

const { Title, Text } = Typography;

// Helper function to calculate minutes difference from current time
const calculateMinutesFromNow = (targetTime, currentTime) => {
  if (!targetTime || !currentTime) return null;
  
  try {
    // Parse time strings (format: "HH:MM:SS")
    const [targetHour, targetMinute, targetSecond] = targetTime.split(':').map(Number);
    const [currentHour, currentMinute, currentSecond] = currentTime.split(':').map(Number);
    
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

function BusStopList() {
  const [searchParams] = useSearchParams();
  const bus_stop_number = searchParams.get("bus_stop_number");

  const [busStop, setBusStop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Check screen size for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
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
      message.success('Bus data refreshed successfully');
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error('Failed to fetch bus data');
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    if (bus_stop_number) {
      setInitialLoad(true);
      fetchData();
    }
  }, [bus_stop_number]);

  // Helper function to get minutes display
  const getMinutesDisplay = (time) => {
    if (!time || !busStop?.current_time) return null;
    const minutes = calculateMinutesFromNow(time, busStop.current_time);
    if (minutes === null) return null;
    if (minutes === 0) return "Due";
    if (minutes < 0) return "Arrived";
    return `${minutes} min`;
  };

  // Header Skeleton
  const HeaderSkeleton = () => (
    <Card 
      bordered={false}
      style={{ 
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}
    >
      <Space direction={isMobile ? "vertical" : "horizontal"} style={{ width: '100%', justifyContent: 'space-between' }}>
        <Space align="center">
          <Skeleton.Avatar active size={48} shape="square" style={{ borderRadius: '12px' }} />
          <div>
            <Skeleton.Input active style={{ width: 200, marginBottom: 8 }} />
            <Skeleton.Input active size="small" style={{ width: 150 }} />
          </div>
        </Space>
        
        <Skeleton.Button active size={isMobile ? "default" : "large"} style={{ width: 120 }} />
      </Space>

      {/* Bus Stop Information Cards Skeleton */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} sm={12}>
          <Card size="small" style={{ background: '#f8f9fa', borderRadius: '10px' }}>
            <Space>
              <Skeleton.Avatar active size="small" shape="circle" />
              <Skeleton.Input active size="small" style={{ width: 120 }} />
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card size="small" style={{ background: '#f8f9fa', borderRadius: '10px' }}>
            <Space>
              <Skeleton.Avatar active size="small" shape="circle" />
              <Skeleton.Input active size="small" style={{ width: 150 }} />
            </Space>
          </Card>
        </Col>
      </Row>
    </Card>
  );

  // Service Card Skeleton
  const ServiceCardSkeleton = () => (
    <Col xs={24} sm={12} lg={8}>
      <Card
        style={{ 
          borderRadius: '12px',
          border: '1px solid #f0f0f0'
        }}
        bodyStyle={{ padding: '16px' }}
      >
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <Skeleton.Button active size="small" style={{ width: 100, borderRadius: '20px' }} />
        </div>

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          width: '100%'
        }}>
          {/* First Arrival Skeleton */}
          <div style={{ 
            background: '#f8f9fa',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #f0f0f0'
          }}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Space>
                <Skeleton.Avatar active size="small" shape="circle" />
                <Skeleton.Input active size="small" style={{ width: 80 }} />
              </Space>
              <Skeleton.Input active size="small" style={{ width: 40, marginLeft: 24 }} />
            </Space>
          </div>

          {/* Second Arrival Skeleton */}
          <div style={{ 
            background: '#f8f9fa',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #f0f0f0'
          }}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Space>
                <Skeleton.Input active size="small" style={{ width: 90 }} />
              </Space>
              <Skeleton.Input active size="small" style={{ width: 60, marginLeft: 24 }} />
            </Space>
          </div>
        </div>
      </Card>
    </Col>
  );

  // Services Section Skeleton
  const ServicesSkeleton = () => (
    <Card
      title={
        <Space>
          <Skeleton.Avatar active size="small" shape="circle" />
          <Skeleton.Input active size="small" style={{ width: 100 }} />
          <Skeleton.Button active size="small" style={{ width: 60, borderRadius: '12px' }} />
        </Space>
      }
      bordered={false}
      style={{ 
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}
    >
      <Row gutter={[16, 16]}>
        {[1, 2, 3, 4, 5, 6].map((key) => (
          <ServiceCardSkeleton key={key} />
        ))}
      </Row>
    </Card>
  );

  // Show full page skeleton only on initial load
  if (initialLoad && loading) {
    return (
      <div style={{ 
        padding: isMobile ? '16px' : '24px',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: '100vh',
        background: '#f0f2f5'
      }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <HeaderSkeleton />
          <ServicesSkeleton />
        </Space>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: isMobile ? '16px' : '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header Card with Bus Stop Info */}
        <Card 
          bordered={false}
          style={{ 
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
        >
          <Space direction={isMobile ? "vertical" : "horizontal"} style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space align="center">
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: '#1890ff', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <EnvironmentOutlined style={{ fontSize: '24px', color: 'white' }} />
              </div>
              <div>
                <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
                  Live Bus Arrival Time
                </Title>
                <Text type="secondary">View real-time bus arrival information</Text>
              </div>
            </Space>
            
            <Button 
              type="primary"
              icon={<ReloadOutlined />}
              onClick={fetchData}
              loading={loading}
              size={isMobile ? "middle" : "large"}
              style={{ borderRadius: '8px' }}
            >
              Refresh Data
            </Button>
          </Space>

          {/* Bus Stop Information Cards */}
          <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
            <Col xs={24} sm={12}>
              <Card 
                size="small" 
                style={{ 
                  background: '#f8f9fa',
                  borderRadius: '10px',
                  border: '1px solid #f0f0f0'
                }}
              >
                <Space>
                  <NumberOutlined style={{ color: '#1890ff' }} />
                  <Text type="secondary">Stop Number:</Text>
                  {loading ? (
                    <Skeleton.Input active size="small" style={{ width: 80 }} />
                  ) : (
                    <Text strong style={{ fontSize: '16px' }}>
                      {busStop?.bus_stop_number || bus_stop_number || 'N/A'}
                    </Text>
                  )}
                </Space>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card 
                size="small" 
                style={{ 
                  background: '#f8f9fa',
                  borderRadius: '10px',
                  border: '1px solid #f0f0f0'
                }}
              >
                <Space>
                  <EnvironmentOutlined style={{ color: '#52c41a' }} />
                  <Text type="secondary">Stop Name:</Text>
                  {loading ? (
                    <Skeleton.Input active size="small" style={{ width: 120 }} />
                  ) : (
                    <Text strong style={{ fontSize: '16px' }}>
                      {busStop?.bus_stop_name || 'N/A'}
                    </Text>
                  )}
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Current Time Display */}
          {busStop?.current_time && (
            <div style={{ marginTop: '16px', textAlign: 'right' }}>
              <Text type="secondary">
                Current Time: {busStop.current_time.split('.')[0]}
              </Text>
            </div>
          )}
        </Card>

        {/* Services Section */}
        <Card 
          title={
            <Space>
              <ClockCircleOutlined style={{ color: '#1890ff' }} />
              <span>Bus Services</span>
              {!loading && busStop?.bus_details && (
                <Tag color="blue">
                  {busStop.bus_details.length} services
                </Tag>
              )}
              {loading && (
                <Skeleton.Button active size="small" style={{ width: 80, borderRadius: '12px' }} />
              )}
            </Space>
          }
          bordered={false}
          style={{ 
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
        >
          {console.log("bus data in logs = " + JSON.stringify(busStop))}

          {loading ? (
            // Show skeletons during refresh
            <Row gutter={[16, 16]}>
              {[1, 2, 3, 4, 5, 6].map((key) => (
                <ServiceCardSkeleton key={key} />
              ))}
            </Row>
          ) : (
            <>
              {busStop?.bus_details && busStop.bus_details.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {busStop.bus_details.map((service, index) => {
                    const firstArrivalMinutes = getMinutesDisplay(service.arrival_time);
                    const nextArrivalMinutes = getMinutesDisplay(service.next_arrival);
                    
                    return (
                      <Col xs={24} sm={12} lg={8} key={index}>
                        <Card
                          hoverable
                          style={{ 
                            borderRadius: '12px',
                            border: '1px solid #f0f0f0',
                            transition: 'all 0.3s ease'
                          }}
                          bodyStyle={{ padding: '16px' }}
                        >
                          {/* Service Number Badge */}
                          <div style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px'
                          }}>
                            <Tag 
                              color="blue" 
                              style={{ 
                                fontSize: '18px',
                                fontWeight: 'bold',
                                padding: '4px 16px',
                                borderRadius: '20px',
                                border: 'none'
                              }}
                            >
                              Service {service.bus_serviceno}
                            </Tag>
                          </div>

                          {/* Arrival Times */}
                          <div style={{ 
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '16px',
                            width: '100%'
                          }}>
                            {/* First Arrival */}
                            <div style={{ 
                              background: '#f8f9fa',
                              padding: '12px',
                              borderRadius: '8px',
                              border: '1px solid #f0f0f0'
                            }}>
                              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                <Space>
                                  <ClockCircleOutlined style={{ color: '#52c41a' }} />
                                  <Text type="secondary">First:</Text>
                                  <Text strong style={{ fontSize: '16px' }}>
                                    {firstArrivalMinutes || 'N/A'}
                                  </Text>
                                </Space>
                                {service.arrival_time && (
                                  <Text type="secondary" style={{ fontSize: '12px', marginLeft: '24px' }}>
                                    ({service.arrival_time.split('.').slice(0, -1).join('.')})
                                  </Text>
                                )}
                              </Space>
                            </div>

                            {/* Second Arrival */}
                            <div style={{ 
                              background: '#f8f9fa',
                              padding: '12px',
                              borderRadius: '8px',
                              border: '1px solid #f0f0f0'
                            }}>
                              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                <Space>
                                  <Text type="secondary">Second:</Text>
                                  <Text strong style={{ fontSize: '16px' }}>
                                    {nextArrivalMinutes || 'N/A'}
                                  </Text>
                                </Space>
                                
                                {service.next_arrival ? (
                                  <Text type="secondary" style={{ fontSize: '12px', marginLeft: '24px' }}>
                                    ({service.next_arrival.split('.').slice(0, -1).join('.')})
                                  </Text>
                                ) : (
                                  <Text type="secondary" style={{ marginLeft: '24px', fontSize: '12px' }}>
                                    No further arrivals
                                  </Text>
                                )}
                              </Space>
                            </div>
                          </div>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              ) : (
                <Alert
                  message="No Services Available"
                  description="There are currently no bus services scheduled for this stop."
                  type="warning"
                  showIcon
                  action={
                    <Button size="small" type="primary" onClick={fetchData}>
                      Retry
                    </Button>
                  }
                />
              )}
            </>
          )}
        </Card>

        {/* Footer with timestamp */}
        <Text type="secondary" style={{ display: 'block', textAlign: 'right', fontSize: '12px' }}>
          Last updated: {new Date().toLocaleTimeString()}
        </Text>
      </Space>
    </div>
  );
}

export default BusStopList;
