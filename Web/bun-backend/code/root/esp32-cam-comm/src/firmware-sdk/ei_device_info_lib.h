#ifndef EI_DEVICE_INFO_LIB
#define EI_DEVICE_INFO_LIB

#define DEF_DEVICE_ID "01:02:03:04:05:06"
#define DEF_DEVICE_TYPE "default type"
#define DEF_UPLOAD_API_KEY "0123456789abcdef"
#define DEF_SAMPLE_HMACKEY "0123456789abcdef"
#define DEF_SAMPLE_LABEL "test"
#define DEF_SAMPLE_INTERVAL 0
#define DEF_SAMPLE_LENGTH_MS 0
#define DEF_MANEGEMENT_URL "path"
#define DEF_UPLOAD_HOST "host"
#define DEF_UPLOAD_PATH "path"

/* Include ----------------------------------------------------------------- */
#include "ei_camera_interface.h"
#include "ei_config_types.h"
#include "ei_device_memory.h"
// #include "ei_fusion.h"
#include <cstdint>
#include <cstdlib>
#include <cstring>
#include <string>
#include <vector>

// Available sensors to sample from on this board
typedef struct {
    // Name (e.g. 'Built-in accelerometer')
    const char *name;
    // Frequency list
    float frequencies[5];
    // Max. sample length in seconds (could be depending on the size of the flash chip)
    uint16_t max_sample_length_s;
    // Start sampling, this function should be blocking and is called when sampling commences
    // #ifdef __MBED__
    //     Callback<bool()> start_sampling_cb;
    // #else
    bool (*start_sampling_cb)();
    //#endif
} ei_device_sensor_t;

typedef struct {
    char str[32];
    int val;
} ei_device_data_output_baudrate_t;

typedef struct {
    bool has_snapshot;
    bool support_stream;
    std::string color_depth; /* allowed values: Grayscale, RGB */
    uint8_t resolutions_num;
    ei_device_snapshot_resolutions_t* resolutions;
} EiSnapshotProperties;

typedef ei_config_security_t WiFiSecurityType;

typedef struct {
    char wifi_ssid[128];
    char wifi_password[128];
    WiFiSecurityType wifi_security;
    float sample_interval_ms;
    uint32_t sample_length_ms;
    char sample_label[128];
    char sample_hmac_key[33];
    char upload_host[128];
    char upload_path[128];
    char upload_api_key[128];
    char mgmt_url[128];
    uint32_t magic;
} EiConfig;

typedef enum
{
    eiStateIdle = 0,
    eiStateErasingFlash,
    eiStateSampling,
    eiStateUploading,
    eiStateFinished

} EiState;

class EiDeviceInfo {
protected:
    // Wi-Fi should be board specific
    std::string wifi_ssid = "";
    std::string wifi_password = "";
    WiFiSecurityType wifi_security = EI_SECURITY_NONE;

    std::string device_id = DEF_DEVICE_ID;
    std::string device_type = DEF_DEVICE_TYPE;

    std::string upload_api_key = DEF_UPLOAD_API_KEY;
    std::string sample_hmac_key = DEF_SAMPLE_HMACKEY;

    std::string sample_label = DEF_SAMPLE_LABEL;
    
    float sample_interval_ms = DEF_SAMPLE_INTERVAL;
    uint32_t sample_length_ms = DEF_SAMPLE_LENGTH_MS;

    std::string management_url = DEF_MANEGEMENT_URL;
    std::string upload_host = DEF_UPLOAD_HOST;
    std::string upload_path = DEF_UPLOAD_PATH;
    
#if MULTI_FREQ_ENABLED == 1
    uint8_t fusioning;
    uint32_t sample_interval;
#endif

    EiDeviceMemory *memory;

public:
    EiDeviceInfo(void) {};
    ~EiDeviceInfo(void) {};
    static EiDeviceInfo *get_device(void);

    virtual bool save_config(void)
    {
        EiConfig config;

        memset(&config, 0, sizeof(EiConfig));

        strncpy(config.wifi_ssid, wifi_ssid.c_str(), 128);
        strncpy(config.wifi_password, wifi_password.c_str(), 128);
        config.wifi_security = wifi_security;
        config.sample_interval_ms = sample_interval_ms;
        config.sample_length_ms = sample_length_ms;
        strncpy(config.sample_label, sample_label.c_str(), 128);
        strncpy(config.sample_hmac_key, sample_hmac_key.c_str(), 33);
        strncpy(config.upload_host, upload_host.c_str(), 128);
        strncpy(config.upload_path, upload_path.c_str(), 128);
        strncpy(config.upload_api_key, upload_api_key.c_str(), 128);
        strncpy(config.mgmt_url, management_url.c_str(), 128);
        config.magic = 0xdeadbeef;

        memory->save_config((uint8_t *)&config, sizeof(EiConfig));

        return true;
    }

    virtual void load_config(void)
    {
        EiConfig config;

        memset(&config, 0, sizeof(EiConfig));
        memory->load_config((uint8_t *)&config, sizeof(EiConfig));

        if (config.magic == 0xdeadbeef) {
            wifi_ssid = std::string(config.wifi_ssid, 128);
            wifi_password = std::string(config.wifi_password, 128);
            wifi_security = config.wifi_security;
            sample_interval_ms = config.sample_interval_ms;
            sample_length_ms = config.sample_length_ms;
            sample_label = std::string(config.sample_label, 128);
            sample_hmac_key = std::string(config.sample_hmac_key, 33);
            upload_host = std::string(config.upload_host, 128);
            upload_path = std::string(config.upload_path, 128);
            upload_api_key = std::string(config.upload_api_key, 128);
            management_url = std::string(config.mgmt_url, 128);
        }
    }

    /**
     * @brief This method should init device_id field
     * to any unique ID available on the MCU.
     * It may be MAC address, CPU ID or similar value.
     */
    virtual void init_device_id(void) = 0;

    EiDeviceMemory *get_memory(void)
    {
        return memory;
    }

    virtual const std::string& get_device_type(void)
    {
        return device_type;
    }

    virtual const std::string& get_device_id(void)
    {
        return device_id;
    }

    virtual void set_device_id(std::string id, bool save = true)
    {
        device_id = id;

        if(save) {
            save_config();
        }
    }

    virtual const std::string& get_management_url(void)
    {
        return management_url;
    }

    virtual void set_management_url(std::string mgmt_url, bool save = true)
    {
        management_url = mgmt_url;

        if(save) {
            save_config();
        }
    }

    virtual const std::string& get_sample_hmac_key(void)
    {
        return sample_hmac_key;
    }

    virtual void set_sample_hmac_key(std::string hmac_key, bool save = true)
    {
        sample_hmac_key = hmac_key;

        if(save) {
            save_config();
        }
    }

    virtual const std::string& get_sample_label(void)
    {
        return sample_label;
    }

    virtual void set_sample_label(std::string label, bool save = true)
    {
        sample_label = label;

        if(save) {
            save_config();
        }
    }

    virtual float get_sample_interval_ms(void)
    {
        return sample_interval_ms;
    }

    virtual void set_sample_interval_ms(float interval_ms, bool save = true)
    {
        sample_interval_ms = interval_ms;

        if(save) {
            save_config();
        }
    }

    virtual uint32_t get_sample_length_ms(void)
    {
        return sample_length_ms;
    }

    virtual void set_sample_length_ms(uint32_t length_ms, bool save = true)
    {
        sample_length_ms = length_ms;

        if(save) {
            save_config();
        }
    }

    virtual const std::string& get_upload_host(void)
    {
        return upload_host;
    }

    virtual void set_upload_host(std::string host, bool save = true)
    {
        upload_host = host;

        if(save) {
            save_config();
        }
    }

    virtual const std::string& get_upload_path(void)
    {
        return upload_path;
    }

    virtual void set_upload_path(std::string path, bool save = true)
    {
        upload_path = path;

        if(save) {
            save_config();
        }
    }

    virtual const std::string& get_upload_api_key(void)
    {
        return upload_api_key;
    }

    virtual void set_upload_api_key(std::string upload_api_key, bool save = true)
    {
        this->upload_api_key = upload_api_key;

        if(save) {
            save_config();
        }
    }

    virtual bool get_wifi_connection_status(void)
    {
        return false;
    }

    virtual void clear_config(void)
    {
        device_id = DEF_DEVICE_ID;
        sample_hmac_key = DEF_SAMPLE_HMACKEY;
        upload_api_key = DEF_UPLOAD_API_KEY;
        sample_label = DEF_SAMPLE_LABEL;
        sample_interval_ms = DEF_SAMPLE_INTERVAL;
        sample_length_ms = DEF_SAMPLE_LENGTH_MS;
        management_url = DEF_MANEGEMENT_URL;
        upload_host = DEF_UPLOAD_HOST;
        upload_path = DEF_UPLOAD_PATH;

        this->init_device_id();
    }

    virtual bool get_wifi_present_status(void)
    {
        return false;
    }

    /**
	 * @brief      Get pointer to the list of available sensors, and the number of sensors used
	 * @param      sensor_list       Place pointer to sensor list here
	 * @param      sensor_list_size  Fill in the number of sensors in the list
	 *
	 * @return     The sensor list.
	 */
    virtual bool get_sensor_list(const ei_device_sensor_t **sensor_list, size_t *sensor_list_size)
    {
        *sensor_list = NULL;
        *sensor_list_size = 0;
        return true;
    }

    /**
	 * @brief      Create resolution list for snapshot setting
	 *             The studio and daemon require this list
	 * @param      snapshot_list       Place pointer to resolution list
	 * @param      snapshot_list_size  Write number of resolutions here
	 *
	 * @return     False if all went ok
	 */
    virtual EiSnapshotProperties get_snapshot_list()
    {
        EiSnapshotProperties props;
        return props;
    }

    virtual uint32_t get_data_output_baudrate(void)
    {
        return 115200;
    }

    virtual void set_default_data_output_baudrate(void)
    {
    }

    virtual void set_max_data_output_baudrate(void)
    {
    }

    virtual bool start_sample_thread(void (*sample_read_cb)(void), float sample_interval_ms)
    {
        return false;
    }

    virtual bool stop_sample_thread(void)
    {
        return false;
    }

#if MULTI_FREQ_ENABLED == 1
	uint32_t actual_timer;
    std::vector<float> multi_sample_interval;
    void (*sample_multi_read_callback)(uint8_t);
    
    virtual bool start_multi_sample_thread(void (*sample_multi_read_cb)(uint8_t), float* fusion_sample_interval_ms, uint8_t num_fusioned)
    {
        uint8_t i;
        uint8_t flag = 0;

        this->sample_multi_read_callback = sample_multi_read_cb;
        this->fusioning = num_fusioned;
        this->multi_sample_interval.clear();

        for (i = 0; i < num_fusioned; i++){
            this->multi_sample_interval.push_back(fusion_sample_interval_ms[i]);
        }

        /* to improve, we consider just a 2 sensors case for now */
        this->sample_interval = ei_fusion_calc_multi_gcd(this->multi_sample_interval.data(), this->fusioning);

        /* force first reading */
        for (i = 0; i < this->fusioning; i++){
                flag |= (1<<i);
        }
        this->sample_multi_read_callback(flag);

        this->actual_timer = 0;
        /*
        * TODO
        * start timer/thread
        */
       
        return false;
    }

    virtual uint8_t get_fusioning(void)
    {
        return fusioning;
    }

    virtual uint32_t get_sample_interval(void)
    {
        return sample_interval;
    }

#endif 

    virtual void set_state(EiState)
    {
    }

    // ******* DEPRECATED BELOW HERE *********
    /**
     * @brief      Get byte size of memory block
     *
     * @return     uint32_t size in bytes
     */
    virtual uint32_t filesys_get_block_size(void)
    {
        return 0;
    }

    /**
     * @brief      Get number of available blocks
     *
     * @return     uint32_t
     */
    virtual uint32_t filesys_get_n_available_sample_blocks(void)
    {
        return 0;
    }

    static constexpr int STR_SIZE = 32;
    /**
	 * @brief      Gets the device ID string
     * Deprecated.  C strings are unsafe.
     * Get a copy of string from std::string get_id(), and call str() on that.
	 *
	 * @param      out_buffer  Destination buffer for ID
	 * @param      out_size    Length of ID in bytes
	 *
	 * @return     Zero if ok, non-zero to signal an error
	 */
    virtual int get_id(uint8_t out_buffer[STR_SIZE], size_t *out_size)
    {
        *out_size = device_id.copy((char *)out_buffer, STR_SIZE - 1);
        out_buffer[*out_size] = 0; // Null terminate
        return 0;
    };

    /**
	 * @brief      Get pointer to zero terminatied id string
     * Deprecated.  C strings are unsafe.
     * Get a copy of string from get_id, and call str() on that.
	 *
	 * @return     The id pointer.
	 */
    virtual const char *get_id_pointer(void)
    {
        return device_id.c_str();
    }

    /**
	 * @brief      Gets the device type string
     * Deprecated.  C strings are unsafe.
     * Get a copy of string from std::string get_id(), and call str() on that.
	 * @param      out_buffer  Destination buffer for type
	 * @param      out_size    Length of type string in bytes
	 *
	 * @return     Zero if ok, non-zero to signal an error
	 */
    virtual int get_type(uint8_t out_buffer[STR_SIZE], size_t *out_size)
    {
        *out_size = device_type.copy((char*)out_buffer, STR_SIZE - 1);
        out_buffer[*out_size] = 0; // Null terminate
        return 0;
    }

    /**
	 * @brief      Get pointer to zero terminatied type string
     * Deprecated.  C strings are unsafe.
     * Get a copy of string from std::string get_id(), and call str() on that.
	 * @return     The type pointer.
	 */
    virtual const char *get_type_pointer(void)
    {
        return device_type.c_str();
    }
};

#endif
