import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Spin, Card, Button, Space, Typography, Row, Col, Alert, Tag, Divider, message } from "antd";
import { ReloadOutlined, EnvironmentOutlined, NumberOutlined, ClockCircleOutlined } from "@ant-design/icons";
// import "./bus.css";
// import "./busstop.css";

const { Title, Text } = Typography;

function BusStopList() {
  const [searchParams] = useSearchParams();
  const bus_stop_number = searchParams.get("bus_stop_number");

  const [busStop, setBusStop] = useState(null);
  const [loading, setLoading] = useState(false);
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
        `https://backend-vercel-zeta-eight.vercel.app/api/busstops/number/${bus_stop_number}`
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
    }
  };

  useEffect(() => {
    if (bus_stop_number) {
      fetchData();
    }
  }, [bus_stop_number]);

  // Loading state
  if (loading && !busStop) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spin size={isMobile ? "default" : "large"} />
        <Text type="secondary">Loading bus stop information...</Text>
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
                  Bus Stop Details
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
                  <Text strong style={{ fontSize: '16px' }}>
                    {busStop?.bus_stop_number || bus_stop_number || 'N/A'}
                  </Text>
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
                  <Text strong style={{ fontSize: '16px' }}>
                    {busStop?.bus_stop_name || 'N/A'}
                  </Text>
                </Space>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* Services Section */}
        <Card
          title={
            <Space>
              <ClockCircleOutlined style={{ color: '#1890ff' }} />
              <span>Bus Services</span>
              {busStop?.bussservice && (
                <Tag color="blue" style={{ borderRadius: '12px' }}>
                  {busStop.bussservice.length} service{busStop.bussservice.length !== 1 ? 's' : ''}
                </Tag>
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

          {busStop?.bussservice && busStop.bussservice.length > 0 ? (
            <Row gutter={[16, 16]}>
              {busStop.bussservice.map((service) => (
                <Col xs={24} sm={12} lg={8} key={service.id}>
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
                        Service {service.service_number}
                      </Tag>
                      {loading && <Spin size="small" />}
                    </div>

                    {/* Arrival Times */}
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <div style={{ 
                        background: '#f8f9fa',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #f0f0f0'
                      }}>
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                          <Space>
                            <ClockCircleOutlined style={{ color: '#52c41a' }} />
                            <Text type="secondary">First Arrival:</Text>
                          </Space>
                          <Text strong style={{ fontSize: '16px', marginLeft: '24px' }}>
                            {loading ? <Spin size="small" /> : (service.arrival_time || 'N/A')}
                          </Text>
                          {service.arrival_time && (
                            <Tag color="green" style={{ marginLeft: '24px', marginTop: '4px' }}>
                              Next Bus
                            </Tag>
                          )}
                        </Space>
                      </div>

                      <div style={{ 
                        background: '#f8f9fa',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #f0f0f0'
                      }}>
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                          <Space>
                            <ClockCircleOutlined style={{ color: '#fa8c16' }} />
                            <Text type="secondary">Second Arrival:</Text>
                          </Space>
                          <Text strong style={{ fontSize: '16px', marginLeft: '24px' }}>
                            {loading ? <Spin size="small" /> : (service.next_arrival_time || 'N/A')}
                          </Text>
                          {!service.next_arrival_time && (
                            <Text type="secondary" style={{ marginLeft: '24px', fontSize: '12px' }}>
                              No further arrivals scheduled
                            </Text>
                          )}
                        </Space>
                      </div>
                    </Space>

                    {/* Divider with time indicator */}
                    <Divider style={{ margin: '16px 0 8px 0' }}>
                      <Tag color="default" style={{ fontSize: '11px' }}>
                        Real-time
                      </Tag>
                    </Divider>
                    
                    <Text type="secondary" style={{ fontSize: '11px', display: 'block', textAlign: 'center' }}>
                      Updated just now
                    </Text>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div style={{ padding: '32px 0' }}>
              {loading ? (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <Spin size={isMobile ? "default" : "large"} />
                  <Text type="secondary">Loading bus services...</Text>
                </div>
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
            </div>
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